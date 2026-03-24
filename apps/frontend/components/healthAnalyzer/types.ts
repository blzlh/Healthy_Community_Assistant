/**
 * 健康分析 - 类型定义
 */

/**
 * 健康数据表单
 */
export interface HealthFormData {
  bloodPressure: string;
  heartRate: string;
  bloodSugar: string;
  weight: string;
  height: string;
  age: string;
}

/**
 * 对话消息角色
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * 对话消息
 */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  /** 是否正在生成（流式输出中） */
  isStreaming?: boolean;
  /** 关联的健康数据快照（仅首条 AI 消息） */
  healthDataSnapshot?: HealthFormData;
}

/**
 * 对话会话状态
 */
export interface ChatSession {
  messages: ChatMessage[];
  sessionId: string | null;
  healthData: HealthFormData | null;
}

/**
 * 健康指标字段配置
 */
export interface HealthFieldConfig {
  name: keyof HealthFormData;
  label: string;
  placeholder: string;
  unit: string;
  icon: string;
  iconColor: string;
}

/**
 * 生成唯一 ID
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
