/**
 * 健康对话管理 Hook
 * 负责对话列表、对话切换等业务逻辑
 */

"use client";

import { useCallback } from "react";
import {
  createConversation,
  getConversation,
  getConversations,
  updateConversationTitle,
  deleteConversation,
  saveHealthRecord,
  type Conversation,
  type ConversationWithMessages,
} from "@/services/health-conversation";
import { useAuthStore } from "@/store/auth-store";
import { useHealthStore } from "@/store/health-store";
import type { ChatMessage } from "@/components/healthAnalyzer/types";
import type { HealthFormData } from "@/components/healthAnalyzer/types";

type ConversationResult = {
  ok: boolean;
  message?: string;
};

/**
 * 从消息内容中提取标题
 */
function extractTitleFromContent(content: string): string {
  const cleanContent = content.replace(/\n/g, " ").trim();
  if (cleanContent.length <= 30) {
    return cleanContent;
  }
  return cleanContent.slice(0, 30) + "...";
}

export function useHealthConversation() {
  const token = useAuthStore((state) => state.token);

  // Store 状态
  const currentConversationId = useHealthStore((state) => state.currentConversationId);
  const conversations = useHealthStore((state) => state.conversations);
  const newConversation = useHealthStore((state) => state.newConversation);
  const loadingConversations = useHealthStore((state) => state.loadingConversations);
  const loadingConversation = useHealthStore((state) => state.loadingConversation);

  // Store 操作
  const setMessages = useHealthStore((state) => state.setMessages);
  const setCurrentConversationId = useHealthStore((state) => state.setCurrentConversationId);
  const setConversations = useHealthStore((state) => state.setConversations);
  const addConversation = useHealthStore((state) => state.addConversation);
  const updateConversationInStore = useHealthStore((state) => state.updateConversation);
  const removeConversationFromStore = useHealthStore((state) => state.removeConversation);
  const setNewConversation = useHealthStore((state) => state.setNewConversation);
  const setLoadingConversations = useHealthStore((state) => state.setLoadingConversations);
  const setLoadingConversation = useHealthStore((state) => state.setLoadingConversation);
  const resetStore = useHealthStore((state) => state.reset);

  /**
   * 加载对话列表
   */
  const loadConversations = useCallback(async (): Promise<ConversationResult> => {
    if (!token) {
      return { ok: false, message: "未登录" };
    }
    setLoadingConversations(true);
    try {
      const response = await getConversations(token);
      if (response.success && response.data) {
        setConversations(response.data);
      }
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "加载对话列表失败";
      return { ok: false, message };
    } finally {
      setLoadingConversations(false);
    }
  }, [token, setConversations, setLoadingConversations]);

  /**
   * 创建新对话
   */
  const createNewConversation = useCallback(async (title?: string): Promise<ConversationResult & { conversationId?: string }> => {
    if (!token) {
      return { ok: false, message: "未登录" };
    }
    try {
      const response = await createConversation(token, title);
      if (response.success && response.data) {
        return { ok: true, conversationId: response.data.conversationId };
      }
      return { ok: false, message: "创建对话失败" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "创建对话失败";
      return { ok: false, message };
    }
  }, [token]);

  /**
   * 加载对话详情
   */
  const loadConversation = useCallback(
    async (conversationId: string): Promise<ConversationResult & { data?: ConversationWithMessages }> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      setLoadingConversation(true);
      try {
        const response = await getConversation(token, conversationId);
        if (response.success && response.data) {
          const conversation = response.data;

          // 转换消息格式
          const loadedMessages: ChatMessage[] = conversation.messages.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: new Date(m.createdAt).getTime(),
            healthDataSnapshot: m.healthDataSnapshot
              ? {
                  bloodPressure: m.healthDataSnapshot.bloodPressure || "",
                  heartRate: m.healthDataSnapshot.heartRate || "",
                  bloodSugar: m.healthDataSnapshot.bloodSugar || "",
                  weight: m.healthDataSnapshot.weight || "",
                  height: m.healthDataSnapshot.height || "",
                  age: m.healthDataSnapshot.age || "",
                }
              : undefined,
          }));

          setMessages(loadedMessages);
          setCurrentConversationId(conversationId);

          return { ok: true, data: conversation };
        }
        return { ok: false, message: "加载对话失败" };
      } catch (error) {
        const message = error instanceof Error ? error.message : "加载对话失败";
        return { ok: false, message };
      } finally {
        setLoadingConversation(false);
      }
    },
    [token, setMessages, setCurrentConversationId, setLoadingConversation]
  );

  /**
   * 更新对话标题
   */
  const updateTitle = useCallback(
    async (conversationId: string, title: string): Promise<ConversationResult> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      try {
        const response = await updateConversationTitle(token, conversationId, title);
        if (response.success) {
          updateConversationInStore(conversationId, { title });
          return { ok: true };
        }
        return { ok: false, message: response.message };
      } catch (error) {
        const message = error instanceof Error ? error.message : "更新标题失败";
        return { ok: false, message };
      }
    },
    [token, updateConversationInStore]
  );

  /**
   * 删除对话
   */
  const deleteConversationById = useCallback(
    async (conversationId: string): Promise<ConversationResult> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      try {
        const response = await deleteConversation(token, conversationId);
        if (response.success) {
          removeConversationFromStore(conversationId);
          // 如果删除的是当前对话，重置状态
          if (currentConversationId === conversationId) {
            resetStore();
          }
          return { ok: true };
        }
        return { ok: false, message: response.message };
      } catch (error) {
        const message = error instanceof Error ? error.message : "删除对话失败";
        return { ok: false, message };
      }
    },
    [token, currentConversationId, removeConversationFromStore, resetStore]
  );

  /**
   * 保存健康记录
   */
  const saveRecord = useCallback(
    async (
      conversationId: string,
      data: {
        bloodPressure?: string;
        heartRate?: string;
        bloodSugar?: string;
        weight?: string;
        height?: string;
        age?: string;
        notes?: string;
      }
    ): Promise<ConversationResult & { recordId?: string }> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      try {
        const response = await saveHealthRecord(token, {
          ...data,
          conversationId,
        });
        if (response.success && response.data) {
          return { ok: true, recordId: response.data.recordId };
        }
        return { ok: false, message: "保存记录失败" };
      } catch (error) {
        const message = error instanceof Error ? error.message : "保存记录失败";
        return { ok: false, message };
      }
    },
    [token]
  );

  /**
   * 重置当前对话
   */
  const resetConversation = useCallback(() => {
    resetStore();
  }, [resetStore]);

  /**
   * 开始新对话（设置初始状态）
   */
  const startNewConversation = useCallback(
    async (firstMessage?: string): Promise<ConversationResult & { conversationId?: string }> => {
      // 创建新对话
      const title = firstMessage ? extractTitleFromContent(firstMessage) : undefined;
      const result = await createNewConversation(title);

      if (result.ok && result.conversationId) {
        setCurrentConversationId(result.conversationId);

        // 设置新对话用于显示在列表中
        setNewConversation({
          id: result.conversationId,
          userId: "",
          title: title || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      return result;
    },
    [createNewConversation, setCurrentConversationId, setNewConversation]
  );

  return {
    // 状态
    currentConversationId,
    conversations,
    newConversation,
    loadingConversations,
    loadingConversation,
    // 方法
    loadConversations,
    createNewConversation,
    loadConversation,
    updateTitle,
    deleteConversationById,
    saveRecord,
    resetConversation,
    startNewConversation,
    setNewConversation,
    extractTitleFromContent,
  };
}
