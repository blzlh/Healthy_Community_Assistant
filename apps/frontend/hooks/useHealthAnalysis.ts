/**
 * Next.js 前端 - 健康分析 API 调用 Hook
 * 支持流式输出 + 多轮对话
 */

import { useState, useCallback, useRef } from 'react';
import { HealthFormData, ChatMessage, generateMessageId } from '@/components/healthAnalyzer/types';

interface HealthDataInput {
  bloodPressure?: string;
  heartRate?: string;
  bloodSugar?: string;
  weight?: string;
  height?: string;
  age?: number;
  sleepHours?: number;
  exerciseMinutes?: number;
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
  messages: ChatMessage[];
  // 方法
  analyze: (data: HealthDataInput, formData?: HealthFormData) => Promise<string | null>;
  continueConversation: (question: string) => Promise<void>;
  reset: () => void;
  abort: () => void;
  // 内部方法（供外部更新消息）
  addMessage: (role: 'user' | 'assistant', content: string, isStreaming?: boolean) => string;
  updateMessage: (id: string, content: string, append?: boolean) => void;
  setStreaming: (id: string, isStreaming: boolean) => void;
}

/**
 * 健康分析 Hook (支持流式输出 + 多轮对话)
 */
export function useHealthAnalysis(): UseHealthAnalysisReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

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
    setMessages(prev => [...prev, message]);
    return id;
  }, []);

  /**
   * 更新消息内容
   */
  const updateMessage = useCallback((id: string, content: string, append = false) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== id) return msg;
      return {
        ...msg,
        content: append ? msg.content + content : content,
      };
    }));
  }, []);

  /**
   * 设置消息流式状态
   */
  const setStreaming = useCallback((id: string, isStreaming: boolean) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== id) return msg;
      return { ...msg, isStreaming };
    }));
  }, []);

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
  const analyze = useCallback(async (data: HealthDataInput, formData?: HealthFormData): Promise<string | null> => {
    // 中断之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    // 添加用户消息（显示提交的数据）
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

    if (dataPreview) {
      addMessage('user', `请帮我分析以下健康数据：${dataPreview}`);
    } else {
      addMessage('user', '请帮我进行健康分析');
    }

    // 添加 AI 消息占位（流式输出）
    const aiMessageId = addMessage('assistant', '', true);
    currentStreamingIdRef.current = aiMessageId;

    // 如果提供了表单数据，附加到消息
    if (formData) {
      setMessages(prev => prev.map(msg => {
        if (msg.id === aiMessageId) {
          return { ...msg, healthDataSnapshot: formData };
        }
        return msg;
      }));
    }

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
        // 被中断，移除空的 AI 消息占位
        setMessages(prev => prev.filter(m => m.id !== aiMessageId));
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
  }, [API_BASE, sessionId, addMessage, updateMessage, setStreaming]);

  /**
   * 继续对话 (流式)
   */
  const continueConversation = useCallback(async (question: string) => {
    if (!sessionId) {
      setError('请先提交健康数据进行分析');
      addMessage('assistant', '❌ 错误: 请先提交健康数据进行分析');
      return;
    }

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
        // 被中断，移除空的 AI 消息占位
        setMessages(prev => prev.filter(m => m.id !== aiMessageId));
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
  }, [API_BASE, sessionId, addMessage, updateMessage, setStreaming]);

  /**
   * 中断请求
   */
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      // 移除空的 AI 占位消息（内容为空或内容很少的流式消息）
      if (currentStreamingIdRef.current) {
        setMessages(prev => {
          const streamingId = currentStreamingIdRef.current;
          const msg = prev.find(m => m.id === streamingId);
          // 如果消息内容为空或内容很短（少于10个字符），则移除
          if (msg && msg.content.trim().length < 10) {
            return prev.filter(m => m.id !== streamingId);
          }
          return prev.map(m => m.id === streamingId ? { ...m, isStreaming: false } : m);
        });
      }
      currentStreamingIdRef.current = null;
    }
  }, []);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    abort();
    setLoading(false);
    setError(null);
    setMessages([]);
    setSessionId(null);
    currentStreamingIdRef.current = null;
  }, [abort]);

  return {
    loading,
    error,
    sessionId,
    messages,
    analyze,
    continueConversation,
    reset,
    abort,
    addMessage,
    updateMessage,
    setStreaming,
  };
}
