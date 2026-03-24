/**
 * 健康分析 - 对话历史管理 Hook
 */

"use client";

import { useState, useCallback } from 'react';
import { ChatMessage, HealthFormData, generateMessageId } from '../components/healthAnalyzer/types';

interface UseChatHistoryReturn {
  messages: ChatMessage[];
  healthData: HealthFormData | null;
  sessionId: string | null;
  addMessage: (role: 'user' | 'assistant', content: string, isStreaming?: boolean) => string;
  updateMessage: (id: string, content: string, append?: boolean) => void;
  setStreaming: (id: string, isStreaming: boolean) => void;
  setSessionId: (id: string) => void;
  setHealthData: (data: HealthFormData) => void;
  clearHistory: () => void;
  getLastAssistantMessage: () => ChatMessage | undefined;
}

export function useChatHistory(): UseChatHistoryReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [healthData, setHealthData] = useState<HealthFormData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

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

    // 如果是首条 assistant 消息，附加健康数据快照
    if (role === 'assistant' && !messages.some(m => m.role === 'assistant')) {
      message.healthDataSnapshot = healthData || undefined;
    }

    setMessages(prev => [...prev, message]);
    return id;
  }, [healthData, messages]);

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
   * 获取最后一条 assistant 消息
   */
  const getLastAssistantMessage = useCallback((): ChatMessage | undefined => {
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    return assistantMessages[assistantMessages.length - 1];
  }, [messages]);

  /**
   * 清空历史
   */
  const clearHistory = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    // 保留 healthData，用户可能想继续使用相同数据
  }, []);

  return {
    messages,
    healthData,
    sessionId,
    addMessage,
    updateMessage,
    setStreaming,
    setSessionId,
    setHealthData,
    clearHistory,
    getLastAssistantMessage,
  };
}
