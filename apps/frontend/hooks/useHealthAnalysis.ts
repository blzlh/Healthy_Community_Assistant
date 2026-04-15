/**
 * Next.js 前端 - 健康分析 API 调用 Hook
 * 支持流式输出 + 多轮对话
 * 使用 Zustand store 管理状态
 */

import { useCallback, useRef } from 'react';
import { HealthFormData, ChatMessage, generateMessageId } from '@/components/healthAnalyzer/types';
import { useHealthStore } from '@/store/health-store';
import { useAuthStore } from '@/store/auth-store';

interface HealthDataInput {
  bloodPressure?: string;
  heartRate?: string;
  bloodSugar?: string;
  weight?: string;
  height?: string;
  age?: number;
}

// 流式事件类型
interface StreamEvent {
  type: 'content' | 'conversation_id' | 'done' | 'error';
  content?: string;
  conversationId?: string;
  error?: string;
}

interface UseHealthAnalysisReturn {
  // 状态
  loading: boolean;
  error: string | null;
  sessionId: string | null;
  currentConversationId: string | null;
  messages: ChatMessage[];
  // 方法
  analyze: (data: HealthDataInput, formData?: HealthFormData, conversationId?: string) => Promise<string | null>;
  continueConversation: (question: string, conversationId?: string) => Promise<void>;
  reset: () => void;
  abort: () => void;
  // 内部方法（供外部更新消息）
  addMessage: (role: 'user' | 'assistant', content: string, isStreaming?: boolean) => string;
  updateMessage: (id: string, content: string, append?: boolean) => void;
  setStreaming: (id: string, isStreaming: boolean) => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

/**
 * 健康分析 Hook (支持流式输出 + 多轮对话)
 */
export function useHealthAnalysis(): UseHealthAnalysisReturn {
  // 从 store 获取状态和操作
  const messages = useHealthStore((state) => state.messages);
  const sessionId = useHealthStore((state) => state.sessionId);
  const currentConversationId = useHealthStore((state) => state.currentConversationId);
  const loading = useHealthStore((state) => state.loading);
  const error = useHealthStore((state) => state.error);

  const setMessagesState = useHealthStore((state) => state.setMessages);
  const addMessageToStore = useHealthStore((state) => state.addMessage);
  const updateMessageInStore = useHealthStore((state) => state.updateMessage);
  const setStreamingInStore = useHealthStore((state) => state.setStreaming);
  const setSessionId = useHealthStore((state) => state.setSessionId);
  const setCurrentConversationId = useHealthStore((state) => state.setCurrentConversationId);
  const setLoading = useHealthStore((state) => state.setLoading);
  const setError = useHealthStore((state) => state.setError);
  const resetStore = useHealthStore((state) => state.reset);

  // 当前流式消息 ID
  const currentStreamingIdRef = useRef<string | null>(null);
  // 用于中断请求
  const abortControllerRef = useRef<AbortController | null>(null);

  // API 基础地址
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  /**
   * 添加消息
   */
  const addMessage = useCallback((role: 'user' | 'assistant', content: string, isStreaming = false): string => {
    const id = generateMessageId();
    const message: ChatMessage = {
      id,
      role,
      content,
      timestamp: Date.now(),
      isStreaming,
    };
    addMessageToStore(message);
    return id;
  }, [addMessageToStore]);

  /**
   * 更新消息内容
   */
  const updateMessage = useCallback((id: string, content: string, append = false) => {
    updateMessageInStore(id, content, append);
  }, [updateMessageInStore]);

  /**
   * 设置消息流式状态
   */
  const setStreaming = useCallback((id: string, isStreaming: boolean) => {
    setStreamingInStore(id, isStreaming);
  }, [setStreamingInStore]);

  /**
   * 解析 SSE 流
   */
  const parseSSEStream = async (
    response: Response,
    onContent: (content: string) => void,
    onConversationId: (id: string) => void,
    onDone: () => void,
    onError: (error: string) => void
  ) => {
    const reader = response.body?.getReader();
    if (!reader) {
      onError('无法读取响应流');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();

          if (trimmedLine.startsWith('data:')) {
            const dataStr = trimmedLine.slice(5).trim();

            try {
              const event: StreamEvent = JSON.parse(dataStr);

              switch (event.type) {
                case 'content':
                  if (event.content) {
                    onContent(event.content);
                  }
                  break;
                case 'conversation_id':
                  if (event.conversationId) {
                    onConversationId(event.conversationId);
                  }
                  break;
                case 'done':
                  onDone();
                  break;
                case 'error':
                  if (event.error) {
                    onError(event.error);
                  }
                  break;
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  /**
   * 分析健康数据 (流式) - 返回 AI 消息 ID
   */
  const analyze = useCallback(async (data: HealthDataInput, formData?: HealthFormData, conversationId?: string): Promise<string | null> => {
    // 中断之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    // 添加用户消息（隐藏，不渲染）
    const fieldNames: Record<string, string> = {
      bloodPressure: '血压',
      heartRate: '心率',
      bloodSugar: '空腹血糖',
      weight: '体重',
      height: '身高',
      age: '年龄',
    };

    const dataPreview = Object.entries(data)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${fieldNames[k] || k}: ${v}`)
      .join('、');

    // 用户消息隐藏（数据存在但不渲染）
    const userId = generateMessageId();
    const userMessage: ChatMessage = {
      id: userId,
      role: 'user',
      content: dataPreview || '健康数据分析',
      timestamp: Date.now(),
      hidden: true,
    };
    addMessageToStore(userMessage);

    // 添加 AI 消息占位（流式输出），并附加健康数据快照
    const aiMessageId = generateMessageId();
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
      healthDataSnapshot: formData,
    };
    addMessageToStore(aiMessage);
    currentStreamingIdRef.current = aiMessageId;

    try {
      const response = await fetch(`${API_BASE}/health-analysis/analyze/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          ...data,
          sessionId,
          conversationId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await parseSSEStream(
        response,
        (content) => {
          if (currentStreamingIdRef.current) {
            updateMessage(currentStreamingIdRef.current, content, true);
          }
        },
        (id) => {
          setSessionId(id);
        },
        () => {
          if (currentStreamingIdRef.current) {
            setStreaming(currentStreamingIdRef.current, false);
          }
          setLoading(false);
        },
        (errorMsg) => {
          setError(errorMsg);
          if (currentStreamingIdRef.current) {
            setStreaming(currentStreamingIdRef.current, false);
            updateMessage(currentStreamingIdRef.current, `❌ 错误: ${errorMsg}`);
          }
          setLoading(false);
        }
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // 被中断，移除空的 AI 消息占位（使用 store 直接操作，避免闭包问题）
        useHealthStore.setState((state) => ({
          messages: state.messages.filter(m => m.id !== aiMessageId),
        }));
        return aiMessageId;
      }
      const errorMsg = err instanceof Error ? err.message : '分析失败，请稍后重试';
      setError(errorMsg);
      if (currentStreamingIdRef.current) {
        setStreaming(currentStreamingIdRef.current, false);
        updateMessage(currentStreamingIdRef.current, `❌ 错误: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
      currentStreamingIdRef.current = null;
    }

    return aiMessageId;
  }, [API_BASE, sessionId, messages, addMessage, updateMessage, setStreaming, setLoading, setError, setSessionId, setMessagesState]);

  /**
   * 继续对话 (流式)
   */
  const continueConversation = useCallback(async (question: string, conversationId?: string) => {
    // 中断之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    // 添加用户问题
    addMessage('user', question);

    // 添加 AI 消息占位
    const aiMessageId = addMessage('assistant', '', true);
    currentStreamingIdRef.current = aiMessageId;

    try {
      const response = await fetch(`${API_BASE}/health-analysis/continue/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          question,
          sessionId,
          conversationId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await parseSSEStream(
        response,
        (content) => {
          if (currentStreamingIdRef.current) {
            updateMessage(currentStreamingIdRef.current, content, true);
          }
        },
        (id) => {
          setSessionId(id);
        },
        () => {
          if (currentStreamingIdRef.current) {
            setStreaming(currentStreamingIdRef.current, false);
          }
          setLoading(false);
        },
        (errorMsg) => {
          setError(errorMsg);
          if (currentStreamingIdRef.current) {
            setStreaming(currentStreamingIdRef.current, false);
            updateMessage(currentStreamingIdRef.current, `❌ 错误: ${errorMsg}`);
          }
          setLoading(false);
        }
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // 被中断，移除空的 AI 消息占位（使用 store 直接操作，避免闭包问题）
        useHealthStore.setState((state) => ({
          messages: state.messages.filter(m => m.id !== aiMessageId),
        }));
        return;
      }
      const errorMsg = err instanceof Error ? err.message : '对话失败，请稍后重试';
      setError(errorMsg);
      if (currentStreamingIdRef.current) {
        setStreaming(currentStreamingIdRef.current, false);
        updateMessage(currentStreamingIdRef.current, `❌ 错误: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
      currentStreamingIdRef.current = null;
    }
  }, [API_BASE, sessionId, messages, addMessage, updateMessage, setStreaming, setLoading, setError, setSessionId, setMessagesState]);

  /**
   * 中断请求
   */
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      // 移除空的 AI 占位消息
      if (currentStreamingIdRef.current) {
        const streamingId = currentStreamingIdRef.current;
        // 直接使用 store 来更新
        useHealthStore.setState((state) => {
          const msg = state.messages.find(m => m.id === streamingId);
          // 如果消息内容为空或内容很短（少于10个字符），则移除
          if (msg && msg.content.trim().length < 10) {
            return { messages: state.messages.filter(m => m.id !== streamingId) };
          }
          return { messages: state.messages.map(m => m.id === streamingId ? { ...m, isStreaming: false } : m) };
        });
      }
      currentStreamingIdRef.current = null;
    }
  }, [setLoading]);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    abort();
    resetStore();
    currentStreamingIdRef.current = null;
  }, [abort, resetStore]);

  // 兼容旧的 setMessages 接口
  const setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>> = useCallback(
    (action) => {
      if (typeof action === 'function') {
        setMessagesState(action(messages));
      } else {
        setMessagesState(action);
      }
    },
    [messages, setMessagesState]
  );

  return {
    loading,
    error,
    sessionId,
    currentConversationId,
    messages,
    analyze,
    continueConversation,
    reset,
    abort,
    addMessage,
    updateMessage,
    setStreaming,
    setMessages,
  };
}
