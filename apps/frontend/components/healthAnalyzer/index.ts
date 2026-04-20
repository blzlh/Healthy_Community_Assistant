/**
 * 健康分析组件导出
 */

// 内容组件（由页面层级控制 Header）
export { HealthChatContent } from "./HealthChatContent";

// 头部
export { HealthAnalyzerHeader } from "./HealthAnalyzerHeader";

// 数据面板
export { HealthDataPanel, HEALTH_FIELDS } from "./HealthDataPanel";

// 数据快照（可编辑）
export { HealthDataSnapshot } from "./HealthDataSnapshot";

// 对话列表
export { HealthConversationList } from "./HealthConversationList";

// 对话服务类型
export type { Conversation, ConversationMessage, ConversationWithMessages, HealthRecord } from "@/services/health-conversation";

// 对话组件
export { HealthChatMessageList } from "./HealthChatMessageList";
export { HealthChatComposer, parseSuggestedQuestions, stripSuggestedQuestions } from "./HealthChatComposer";

// 骨架屏
export { ChatLoadingSkeleton } from "./ChatLoadingSkeleton";

// 类型
export type {
  HealthFormData,
  ChatMessage,
  MessageRole,
  ChatSession,
  HealthFieldConfig,
} from "./types";

export { generateMessageId } from "./types";
