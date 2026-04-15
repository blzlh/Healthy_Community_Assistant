/**
 * 健康对话容器组件 - 支持两种模式
 * 
 * mode="chat" - 普通对话模式，直接对话（也可接收从 analysis 跳转来的健康数据）
 * mode="analysis" - 健康数据分析模式，需要先录入数据
 */

"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useHealthAnalysis } from "@/hooks/useHealthAnalysis";
import { useHealthConversation } from "@/hooks/use-health-conversation";
import { HealthFormData, ChatMessage } from "./types";
import { HealthDataPanel } from "./HealthDataPanel";
import { HealthChatMessageList } from "./HealthChatMessageList";
import { HealthChatComposer, parseSuggestedQuestions } from "./HealthChatComposer";
import { HealthAnalyzerHeader } from "./HealthAnalyzerHeader";
import { HealthConversationList } from "./HealthConversationList";
import { ChatLoadingSkeleton } from "./ChatLoadingSkeleton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/shadcn/button";
import { useAuthStore } from "@/store/auth-store";
import { useHealthStore } from "@/store/health-store";
import { BackToHome } from "@/components/BackToHome";

type HealthChatMode = "chat" | "analysis";

interface HealthChatContainerProps {
  mode: HealthChatMode;
}

/**
 * 将表单数据转换为 API 参数
 */
function formDataToApiData(formData: HealthFormData) {
  return {
    bloodPressure: formData.bloodPressure || undefined,
    heartRate: formData.heartRate || undefined,
    bloodSugar: formData.bloodSugar || undefined,
    weight: formData.weight || undefined,
    height: formData.height || undefined,
    age: formData.age ? parseInt(formData.age) : undefined,
  };
}

export function HealthChatContainer({ mode }: HealthChatContainerProps) {
  // 使用重构后的 hooks
  const {
    analyze,
    continueConversation,
    loading,
    error,
    sessionId,
    messages,
    reset,
    abort,
    setMessages,
  } = useHealthAnalysis();

  const {
    currentConversationId,
    conversations,
    newConversation,
    loadingConversation,
    startNewConversation,
    loadConversation,
    updateTitle,
    resetConversation,
    setNewConversation,
    extractTitleFromContent,
  } = useHealthConversation();

  const token = useAuthStore((state) => state.token);
  const pendingHealthData = useHealthStore((state) => state.pendingHealthData);
  const clearPendingHealthData = useHealthStore((state) => state.clearPendingHealthData);

  // 表单数据（仅 analysis 模式使用）
  const [formData, setFormData] = useState<HealthFormData>({
    bloodPressure: "",
    heartRate: "",
    bloodSugar: "",
    weight: "",
    height: "",
    age: "",
  });
  // 是否已开始对话（chat 模式）
  const [chatStarted, setChatStarted] = useState(false);
  // 对话列表是否显示
  const [showConversationList, setShowConversationList] = useState(true);
  // 用于防止重复处理 pendingHealthData
  const hasProcessedPendingRef = useRef(false);
  // 处理 pendingHealthData 时的本地加载状态
  const [processingPending, setProcessingPending] = useState(false);

  const isAnalysisMode = mode === "analysis";
  const isChatMode = mode === "chat";

  // 用于中断跳转后的请求
  const pendingAbortControllerRef = useRef<AbortController | null>(null);

  /**
   * 处理从 analysis 页面跳转来的健康数据
   */
  useEffect(() => {
    // 当有待处理的健康数据，且尚未处理过时，开始分析
    if (isChatMode && pendingHealthData && !hasProcessedPendingRef.current) {
      hasProcessedPendingRef.current = true;
      // 立即设置为对话已开始，跳过欢迎界面
      setChatStarted(true);
      setFormData(pendingHealthData);
      setProcessingPending(true);
      useHealthStore.setState({ loading: true });
      
      const processPendingData = async () => {
        // 创建 AbortController 用于中断请求
        const abortController = new AbortController();
        pendingAbortControllerRef.current = abortController;
        
        try {
          if (!token) {
            console.error("用户未登录");
            clearPendingHealthData();
            setProcessingPending(false);
            useHealthStore.setState({ loading: false });
            return;
          }

          // 转换数据格式
          const apiData = {
            bloodPressure: pendingHealthData.bloodPressure || undefined,
            heartRate: pendingHealthData.heartRate || undefined,
            bloodSugar: pendingHealthData.bloodSugar || undefined,
            weight: pendingHealthData.weight || undefined,
            height: pendingHealthData.height || undefined,
            age: pendingHealthData.age ? parseInt(pendingHealthData.age) : undefined,
          };

          // 生成消息 ID
          const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
          
          // 用户消息（隐藏，不渲染）
          const userMessageId = generateId();
          const fieldNames: Record<string, string> = {
            bloodPressure: '血压',
            heartRate: '心率',
            bloodSugar: '空腹血糖',
            weight: '体重',
            height: '身高',
            age: '年龄',
          };
          const dataPreview = Object.entries(apiData)
            .filter(([, v]) => v !== undefined && v !== '')
            .map(([k, v]) => `${fieldNames[k] || k}: ${v}`)
            .join('、');
          const displayContent = dataPreview || '健康数据分析';
          
          // AI 消息占位
          const aiMessageId = generateId();
          
          // 立即添加消息（用户消息隐藏）
          useHealthStore.setState((state) => ({
            messages: [
              ...state.messages,
              { id: userMessageId, role: 'user', content: displayContent, timestamp: Date.now(), hidden: true },
              { id: aiMessageId, role: 'assistant', content: '', timestamp: Date.now(), isStreaming: true, healthDataSnapshot: pendingHealthData },
            ],
          }));

          // 创建新对话
          const result = await startNewConversation();
          if (abortController.signal.aborted) return;
          
          if (!result.ok || !result.conversationId) {
            console.error("创建对话失败:", result.message);
            clearPendingHealthData();
            setProcessingPending(false);
            useHealthStore.setState({ loading: false });
            return;
          }
          const conversationIdToUse = result.conversationId;

          // 更新对话标题
          try {
            await updateTitle(conversationIdToUse, `健康数据分析`);
          } catch (err) {
            console.error("设置对话标题失败:", err);
          }

          // 开始流式分析
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          const response = await fetch(`${API_BASE}/health-analysis/analyze/stream`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'text/event-stream',
            },
            body: JSON.stringify({
              ...apiData,
              conversationId: conversationIdToUse,
            }),
            signal: abortController.signal,
          });

          if (abortController.signal.aborted) return;

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // 解析 SSE 流
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('无法读取响应流');
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (!abortController.signal.aborted) {
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
                  const event = JSON.parse(dataStr);
                  if (event.type === 'content' && event.content) {
                    useHealthStore.setState((state) => ({
                      messages: state.messages.map((m) =>
                        m.id === aiMessageId
                          ? { ...m, content: m.content + event.content }
                          : m
                      ),
                    }));
                  } else if (event.type === 'done') {
                    useHealthStore.setState((state) => ({
                      messages: state.messages.map((m) =>
                        m.id === aiMessageId ? { ...m, isStreaming: false } : m
                      ),
                      loading: false,
                    }));
                  } else if (event.type === 'error') {
                    useHealthStore.setState((state) => ({
                      messages: state.messages.map((m) =>
                        m.id === aiMessageId
                          ? { ...m, content: `❌ 错误: ${event.error}`, isStreaming: false }
                          : m
                      ),
                      loading: false,
                    }));
                  }
                } catch {
                  // 忽略解析错误
                }
              }
            }
          }

          // 如果被中断，移除 AI 消息
          if (abortController.signal.aborted) {
            useHealthStore.setState((state) => ({
              messages: state.messages.filter((m) => m.id !== aiMessageId),
              loading: false,
            }));
            return;
          }
        } catch (err: any) {
          if (err.name === 'AbortError') {
            // 被中断，移除 AI 消息
            useHealthStore.setState((state) => ({
              messages: state.messages.filter((m) => !m.isStreaming),
              loading: false,
            }));
          } else {
            console.error("处理健康数据失败:", err);
          }
        } finally {
          clearPendingHealthData();
          setProcessingPending(false);
          useHealthStore.setState({ loading: false });
          pendingAbortControllerRef.current = null;
        }
      };

      processPendingData();
    }
  }, [isChatMode, pendingHealthData, token, startNewConversation, updateTitle, clearPendingHealthData]);

  /**
   * 中断跳转后的请求
   */
  const handleAbortPending = useCallback(() => {
    if (pendingAbortControllerRef.current) {
      pendingAbortControllerRef.current.abort();
    }
    // 同时调用原有的 abort
    abort();
  }, [abort]);

  /**
   * 创建新对话
   */
  const handleNewConversation = useCallback(async () => {
    if (currentConversationId && messages.length > 0 && token) {
      const firstUserMessage = messages.find((m) => m.role === "user");
      if (firstUserMessage) {
        const title = extractTitleFromContent(firstUserMessage.content);
        try {
          await updateTitle(currentConversationId, title);
        } catch (err) {
          console.error("更新对话标题失败:", err);
        }
      }
    }

    reset();
    resetConversation();
    setChatStarted(false);
    setFormData({
      bloodPressure: "",
      heartRate: "",
      bloodSugar: "",
      weight: "",
      height: "",
      age: "",
    });
  }, [currentConversationId, messages, reset, resetConversation, token, updateTitle, extractTitleFromContent]);

  /**
   * 选择历史对话
   */
  const handleSelectConversation = useCallback(
    async (conversationId: string) => {
      const result = await loadConversation(conversationId);
      if (result.ok && result.data) {
        // 从加载的消息中提取健康数据
        const firstMessageWithData = result.data.messages.find(
          (m) => m.healthDataSnapshot && Object.values(m.healthDataSnapshot).some(Boolean)
        );

        if (firstMessageWithData?.healthDataSnapshot) {
          setFormData({
            bloodPressure: firstMessageWithData.healthDataSnapshot.bloodPressure || "",
            heartRate: firstMessageWithData.healthDataSnapshot.heartRate || "",
            bloodSugar: firstMessageWithData.healthDataSnapshot.bloodSugar || "",
            weight: firstMessageWithData.healthDataSnapshot.weight || "",
            height: firstMessageWithData.healthDataSnapshot.height || "",
            age: firstMessageWithData.healthDataSnapshot.age || "",
          });
        }

        setChatStarted(true);
      } else {
        console.error("加载对话失败:", result.message);
        alert(result.message || "加载对话失败");
      }
    },
    [loadConversation]
  );

  /**
   * 处理输入变化
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  /**
   * 提交健康数据分析
   */
  const handleAnalysisSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!token) {
        alert("请先登录");
        return;
      }

      let conversationIdToUse = currentConversationId;

      if (!conversationIdToUse) {
        const result = await startNewConversation();
        if (result.ok && result.conversationId) {
          conversationIdToUse = result.conversationId;
        } else {
          alert(result.message || "创建对话失败");
          return;
        }
      }

      const apiData = formDataToApiData(formData);

      const fieldNames: Record<string, string> = {
        bloodPressure: "血压",
        heartRate: "心率",
        bloodSugar: "空腹血糖",
        weight: "体重",
        height: "身高",
        age: "年龄",
      };
      const dataPreview = Object.entries(apiData)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => `${fieldNames[k] || k}: ${v}`)
        .join("、");
      const userMessageContent = dataPreview
        ? `请帮我分析以下健康数据：${dataPreview}`
        : "请帮我进行健康分析";

      // 只有在对话没有标题时才更新标题
      const currentConv = conversations.find(c => c.id === conversationIdToUse) || newConversation;
      if (!currentConv?.title) {
        const title = extractTitleFromContent(userMessageContent);
        try {
          await updateTitle(conversationIdToUse, title);
        } catch (err) {
          console.error("设置对话标题失败:", err);
        }
      }

      await analyze(apiData, formData, conversationIdToUse || undefined);
    },
    [formData, analyze, currentConversationId, conversations, newConversation, token, startNewConversation, updateTitle, extractTitleFromContent]
  );

  /**
   * 发送消息（chat 模式直接发送，analysis 模式追问）
   */
  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!token) {
        alert("请先登录");
        return;
      }

      let conversationIdToUse = currentConversationId;

      if (!conversationIdToUse) {
        const result = await startNewConversation(message);
        if (result.ok && result.conversationId) {
          conversationIdToUse = result.conversationId;
        } else {
          console.error("创建对话失败:", result.message);
          return;
        }
      } else {
        // 只有在对话没有标题时才更新标题
        const currentConv = conversations.find(c => c.id === conversationIdToUse) || newConversation;
        if (!currentConv?.title) {
          const title = extractTitleFromContent(message);
          try {
            await updateTitle(conversationIdToUse, title);
          } catch (err) {
            console.error("设置对话标题失败:", err);
          }
        }
      }

      await continueConversation(message, conversationIdToUse || undefined);
      setChatStarted(true);
    },
    [continueConversation, currentConversationId, conversations, newConversation, token, startNewConversation, updateTitle, extractTitleFromContent]
  );

  /**
   * 更新健康数据
   */
  const handleDataUpdate = useCallback((data: HealthFormData) => {
    setFormData(data);
  }, []);

  /**
   * 从快照提交新数据重新分析
   */
  const handleDataSubmit = useCallback(
    async (data: HealthFormData) => {
      setFormData(data);
      const apiData = formDataToApiData(data);
      await analyze(apiData, data);
    },
    [analyze]
  );

  /**
   * 重置全部
   */
  const handleReset = useCallback(() => {
    reset();
    setChatStarted(false);
    setFormData({
      bloodPressure: "",
      heartRate: "",
      bloodSugar: "",
      weight: "",
      height: "",
      age: "",
    });
  }, [reset]);

  /**
   * 中断当前请求
   */
  const handleAbort = useCallback(() => {
    // 中断跳转后的请求
    if (pendingAbortControllerRef.current) {
      pendingAbortControllerRef.current.abort();
    }
    // 中断后续对话的请求
    abort();
  }, [abort]);

  // 是否有会话
  const hasSession = sessionId !== null || messages.length > 0;

  // 建议问题
  const suggestedQuestions = useMemo(() => {
    const lastAiMessage = [...messages]
      .reverse()
      .find((m) => m.role === "assistant" && !m.isStreaming);
    if (!lastAiMessage || lastAiMessage.isStreaming) return [];
    return parseSuggestedQuestions(lastAiMessage.content);
  }, [messages]);

  // 模式标签
  const modeLabel = isAnalysisMode ? "健康数据分析" : "自由对话";
  const modeIcon = isAnalysisMode ? "lucide:heart-pulse" : "lucide:message-circle";
  const modeColor = isAnalysisMode ? "text-emerald-400" : "text-sky-400";

  // ============ Analysis 模式：初始状态显示数据录入表单 ============
  if (isAnalysisMode && messages.length === 0 && !loading) {
    return (
      <div className="flex flex-col h-full">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <HealthAnalyzerHeader
            title={modeLabel}
            icon={modeIcon}
            iconColor={modeColor}
          />
          <BackToHome />
        </div>

        {/* 主内容区 */}
        <div className="flex gap-4 flex-1 min-h-0 mt-4">
          {/* 左侧：数据录入 */}
          <div className="flex-1 flex flex-col">
            <HealthDataPanel
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleAnalysisSubmit}
              onReset={handleReset}
              loading={loading}
              collapsed={false}
              className="flex-1"
            />
          </div>

          {/* 右侧：说明信息 */}
          <div className="w-80 flex-shrink-0 hidden lg:flex flex-col gap-4">
            {/* 功能说明 */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Icon icon="lucide:heart-pulse" className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-sm font-medium text-white">健康数据分析</h4>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                录入您的血压、心率、血糖等健康指标，AI 将为您提供个性化的健康分析和建议。
              </p>
            </div>

            {/* 温馨提示 */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center flex-shrink-0">
                  <Icon icon="healthicons:info" className="w-4 h-4 text-sky-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white mb-1">温馨提示</h4>
                  <p className="text-xs text-white/60 leading-relaxed">
                    分析完成后，您可以继续追问相关问题，AI 会结合您的数据进行深入解答。
                  </p>
                </div>
              </div>
            </div>

            {/* 数据安全 */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <Icon icon="lucide:shield-check" className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white mb-1">数据安全</h4>
                  <p className="text-xs text-white/60 leading-relaxed">
                    您的健康数据仅用于本次分析，不会被存储或分享给第三方。
                  </p>
                </div>
              </div>
            </div>

            {/* 底部提示 */}
            <div className="mt-auto text-xs text-white/40 text-center">
              AI 分析结果仅供参考，如有不适请及时就医
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ Chat 模式：初始状态显示欢迎信息 ============
  // 只有在 chat 模式下，没有开始对话，没有正在处理的数据，没有消息，且没有加载时才显示欢迎界面
  if (isChatMode && !chatStarted && !processingPending && messages.length === 0 && !loading && !loadingConversation) {
    return (
      <div className="flex flex-col h-full">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <HealthAnalyzerHeader
            title={modeLabel}
            icon={modeIcon}
            iconColor={modeColor}
          />
          <BackToHome />
        </div>

        <div className="flex gap-4 flex-1 min-h-0 mt-4">
          {/* 左侧：对话列表 */}
          {showConversationList && (
            <div className="w-64 flex-shrink-0 hidden lg:block">
              <div className="h-full rounded-xl border border-white/10 bg-white/5 p-3">
                <HealthConversationList
                  currentConversationId={currentConversationId}
                  onSelectConversation={handleSelectConversation}
                  onNewConversation={handleNewConversation}
                  newConversation={newConversation}
                />
              </div>
            </div>
          )}

          {/* 右侧：欢迎界面 */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            {/* 欢迎信息 */}
            <div className="flex-1 flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 p-8">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center mb-4">
                <Icon icon="lucide:message-circle" className="w-8 h-8 text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">开始健康对话</h2>
              <p className="text-sm text-white/60 text-center max-w-md mb-6">
                您可以向我咨询任何健康相关的问题，我会尽力为您提供专业的建议。
              </p>

              {/* 快捷问题 */}
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "如何保持健康的生活方式？",
                  "每天应该喝多少水？",
                  "如何改善睡眠质量？",
                ].map((question) => (
                  <Button
                    key={question}
                    variant="outline"
                    onClick={() => handleSendMessage(question)}
                    className="!rounded-full !border-white/20 !bg-white/5 !text-white/80 hover:!bg-white/10 hover:!border-white/30 hover:!text-white"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>

            {/* 输入框 */}
            <div className="mt-2 p-4 rounded-xl border border-white/10 bg-white/5">
              <HealthChatComposer
                onSend={handleSendMessage}
                onAbort={handleAbort}
                loading={loading}
                disabled={false}
                placeholder="输入您的健康问题..."
                suggestedQuestions={[]}
                showSuggestions={false}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ 对话状态（两种模式共用） ============
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-3 shrink-0">
        <HealthAnalyzerHeader
          title={modeLabel}
          icon={modeIcon}
          iconColor={modeColor}
        />
        <BackToHome />
      </div>
      <div className="flex gap-4 flex-1 min-h-0 mt-4">

        {/* 左侧：对话列表 */}
        {showConversationList && (
          <div className="w-64 flex-shrink-0 hidden lg:block">
            <div className="h-full rounded-xl border border-white/10 bg-white/5 p-3">
              <HealthConversationList
                currentConversationId={currentConversationId}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
                newConversation={newConversation}
              />
            </div>
          </div>
        )}

        {/* 右侧：对话区域 */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full">
          {/* 对话消息列表 / 加载骨架屏 */}
          {loadingConversation ? (
            <div className="flex-1 min-h-0 rounded-xl border border-white/10 bg-white/5 overflow-y-auto">
              <ChatLoadingSkeleton count={3} />
            </div>
          ) : (
            <HealthChatMessageList
              messages={messages}
              className="flex-1 min-h-0 rounded-xl border border-white/10 bg-white/5"
              onDataUpdate={handleDataUpdate}
              onDataSubmit={handleDataSubmit}
              loading={processingPending || loading}
            />
          )}

          {/* 错误提示 */}
          {error && messages.length === 0 && !loadingConversation && (
            <div className="px-4 pb-2 mt-2">
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-400 text-sm">
                {error}
              </div>
            </div>
          )}

          {/* 对话输入 */}
          <div className="mt-2 p-4 rounded-xl border border-white/10 bg-white/5">
            <HealthChatComposer
              onSend={handleSendMessage}
              onAbort={handleAbort}
              loading={loading}
              disabled={!hasSession && !loading}
              placeholder={hasSession ? "继续提问..." : "请输入您的问题..."}
              suggestedQuestions={suggestedQuestions}
            />
          </div>
        </div>
      </div>

      {/* 提示文字 */}
      <div className="text-xs text-white/40 text-center mt-3 shrink-0">
        AI 分析结果仅供参考，如有不适请及时就医
      </div>
    </div>
  );
}
