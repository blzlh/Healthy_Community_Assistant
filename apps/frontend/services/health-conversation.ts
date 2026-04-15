/**
 * 健康对话服务 - 处理对话历史相关的 API 调用
 */

import { http } from "@/lib/http";

export interface Conversation {
  id: string;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HealthDataSnapshot {
  bloodPressure?: string;
  heartRate?: string;
  bloodSugar?: string;
  weight?: string;
  height?: string;
  age?: string;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  healthDataSnapshot: HealthDataSnapshot | null;
  createdAt: string;
}

export interface ConversationWithMessages {
  id: string;
  userId: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  messages: ConversationMessage[];
}

export interface HealthRecord {
  id: string;
  userId: string;
  conversationId: string | null;
  bloodPressure: string | null;
  heartRate: string | null;
  bloodSugar: string | null;
  weight: string | null;
  height: string | null;
  age: string | null;
  notes: string | null;
  createdAt: string;
}

/**
 * 创建新对话
 */
export async function createConversation(token: string, title?: string) {
  const response = await http.post<{ success: boolean; data: { conversationId: string } }>(
    "/api/health-conversations",
    { title },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

/**
 * 获取用户的对话列表
 */
export async function getConversations(token: string) {
  const response = await http.get<{ success: boolean; data: Conversation[] }>(
    "/api/health-conversations",
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

/**
 * 获取对话详情
 */
export async function getConversation(token: string, conversationId: string) {
  const response = await http.get<{ success: boolean; data: ConversationWithMessages }>(
    `/api/health-conversations/${conversationId}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

/**
 * 更新对话标题
 */
export async function updateConversationTitle(
  token: string,
  conversationId: string,
  title: string
) {
  const response = await http.patch<{ success: boolean; message: string }>(
    `/api/health-conversations/${conversationId}/title`,
    { title },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

/**
 * 删除对话
 */
export async function deleteConversation(token: string, conversationId: string) {
  const response = await http.delete<{ success: boolean; message: string }>(
    `/api/health-conversations/${conversationId}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

/**
 * 保存健康记录
 */
export async function saveHealthRecord(
  token: string,
  data: {
    bloodPressure?: string;
    heartRate?: string;
    bloodSugar?: string;
    weight?: string;
    height?: string;
    age?: string;
    conversationId?: string;
    notes?: string;
  }
) {
  const response = await http.post<{ success: boolean; data: { recordId: string } }>(
    "/api/health-conversations/records",
    data,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}
