/**
 * 健康分析组件导出
 */

// 容器
export { HealthAnalyzerContainer } from "./HealthAnalyzerContainer";

// 头部
export { HealthAnalyzerHeader } from "./HealthAnalyzerHeader";

// 数据面板
export { HealthDataPanel, HEALTH_FIELDS } from "./HealthDataPanel";

// 数据快照（可编辑）
export { HealthDataSnapshot } from "./HealthDataSnapshot";

// 对话组件
export { HealthChatMessageList } from "./HealthChatMessageList";
export { HealthChatComposer, parseSuggestedQuestions, stripSuggestedQuestions } from "./HealthChatComposer";

// 类型
export type {
  HealthFormData,
  ChatMessage,
  MessageRole,
  ChatSession,
  HealthFieldConfig,
} from "./types";

export { generateMessageId } from "./types";

// Hook
export { useChatHistory } from "../../hooks/useChatHistory";

// 旧组件（保留兼容性）
export { HealthInputForm } from "./HealthInputForm";
export { AnalysisResult } from "./AnalysisResult";
export { AnalysisLoading } from "./AnalysisLoading";
export { HealthTips } from "./HealthTips";
