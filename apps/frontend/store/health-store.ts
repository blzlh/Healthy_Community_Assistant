"use client";

import { create } from "zustand";
import type { ChatMessage, HealthFormData } from "@/components/healthAnalyzer/types";
import type { Conversation } from "@/services/health-conversation";

type HealthState = {
  // 消息状态
  messages: ChatMessage[];
  // 会话 ID（Coze API 的 sessionId）
  sessionId: string | null;
  // 当前对话 ID（数据库中的对话 ID）
  currentConversationId: string | null;
  // 对话列表
  conversations: Conversation[];
  // 新创建的对话（用于立即显示在列表中）
  newConversation: Conversation | null;
  // 加载状态
  loading: boolean;
  analyzing: boolean;
  loadingConversations: boolean;
  loadingConversation: boolean;
  // 错误信息
  error: string | null;
  // 待分析的健康数据（从 analysis 页面跳转过来时使用）
  pendingHealthData: HealthFormData | null;

  // 消息操作
  setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, content: string, append?: boolean) => void;
  setStreaming: (id: string, isStreaming: boolean) => void;
  clearMessages: () => void;

  // 会话操作
  setSessionId: (sessionId: string | null) => void;
  setCurrentConversationId: (conversationId: string | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  setNewConversation: (conversation: Conversation | null) => void;

  // 加载状态操作
  setLoading: (loading: boolean) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setLoadingConversations: (loading: boolean) => void;
  setLoadingConversation: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 待分析数据操作
  setPendingHealthData: (data: HealthFormData | null) => void;
  clearPendingHealthData: () => void;

  // 重置
  reset: () => void;
};

export const useHealthStore = create<HealthState>((set) => ({
  // 消息状态
  messages: [],
  sessionId: null,
  currentConversationId: null,
  conversations: [],
  newConversation: null,
  loading: false,
  analyzing: false,
  loadingConversations: false,
  loadingConversation: false,
  error: null,
  pendingHealthData: null,

  // 消息操作
  setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) =>
    set((state) => ({
      messages: typeof messages === "function" ? (messages as (prev: ChatMessage[]) => ChatMessage[])(state.messages) : messages,
    })),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, content, append = false) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id
          ? { ...msg, content: append ? msg.content + content : content }
          : msg
      ),
    })),
  setStreaming: (id, isStreaming) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, isStreaming } : msg
      ),
    })),
  clearMessages: () => set({ messages: [] }),

  // 会话操作
  setSessionId: (sessionId) => set({ sessionId }),
  setCurrentConversationId: (conversationId) =>
    set({ currentConversationId: conversationId }),
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) =>
    set((state) => ({ conversations: [conversation, ...state.conversations] })),
  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === id ? { ...conv, ...updates } : conv
      ),
    })),
  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((conv) => conv.id !== id),
    })),
  setNewConversation: (conversation) => set({ newConversation: conversation }),

  // 加载状态操作
  setLoading: (loading) => set({ loading }),
  setAnalyzing: (analyzing) => set({ analyzing }),
  setLoadingConversations: (loading) => set({ loadingConversations: loading }),
  setLoadingConversation: (loading) => set({ loadingConversation: loading }),
  setError: (error) => set({ error }),

  // 待分析数据操作
  setPendingHealthData: (data) => set({ pendingHealthData: data }),
  clearPendingHealthData: () => set({ pendingHealthData: null }),

  // 重置
  reset: () =>
    set({
      messages: [],
      sessionId: null,
      currentConversationId: null,
      newConversation: null,
      loading: false,
      analyzing: false,
      error: null,
      pendingHealthData: null,
    }),
}));
