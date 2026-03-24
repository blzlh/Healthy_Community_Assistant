/**
 * 健康分析 - 主容器组件
 * 
 * 用户使用流程：
 * 1. 录入健康数据 → 点击"开始分析"
 * 2. AI 返回初步分析（流式输出）
 * 3. 用户可以追问（多轮对话）
 * 4. 随时可以在"本次分析数据"区域修改数据重新分析
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
import { useHealthAnalysis } from "@/hooks/useHealthAnalysis";
import { HealthFormData } from "./types";
import { HealthDataPanel } from "./HealthDataPanel";
import { HealthChatMessageList } from "./HealthChatMessageList";
import { HealthChatComposer, parseSuggestedQuestions } from "./HealthChatComposer";
import { HealthAnalyzerHeader } from "./HealthAnalyzerHeader";

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

export function HealthAnalyzerContainer() {
  const {
    analyze,
    continueConversation,
    loading,
    error,
    sessionId,
    messages,
    reset,
    abort,
  } = useHealthAnalysis();

  // 表单数据
  const [formData, setFormData] = useState<HealthFormData>({
    bloodPressure: '',
    heartRate: '',
    bloodSugar: '',
    weight: '',
    height: '',
    age: '',
  });

  /**
   * 处理输入变化
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  /**
   * 提交分析
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const apiData = formDataToApiData(formData);
    await analyze(apiData, formData);
  }, [formData, analyze]);

  /**
   * 发送追问
   */
  const handleSendMessage = useCallback(async (message: string) => {
    await continueConversation(message);
  }, [continueConversation]);

  /**
   * 更新健康数据（从消息列表中的快照）
   */
  const handleDataUpdate = useCallback((data: HealthFormData) => {
    setFormData(data);
  }, []);

  /**
   * 从快照提交新数据重新分析
   */
  const handleDataSubmit = useCallback(async (data: HealthFormData) => {
    setFormData(data);
    const apiData = formDataToApiData(data);
    await analyze(apiData, data);
  }, [analyze]);

  /**
   * 重置全部
   */
  const handleReset = useCallback(() => {
    reset();
    setFormData({
      bloodPressure: '',
      heartRate: '',
      bloodSugar: '',
      weight: '',
      height: '',
      age: '',
    });
  }, [reset]);

  /**
   * 中断当前请求
   */
  const handleAbort = useCallback(() => {
    abort();
  }, [abort]);

  // 是否有会话
  const hasSession = sessionId !== null || messages.length > 0;

  // 从最后一条 AI 消息中解析建议问题
  const suggestedQuestions = useMemo(() => {
    const lastAiMessage = [...messages].reverse().find(m => m.role === 'assistant' && !m.isStreaming);
    if (!lastAiMessage || lastAiMessage.isStreaming) return [];
    return parseSuggestedQuestions(lastAiMessage.content);
  }, [messages]);

  // 初始状态：没有消息，显示数据录入表单
  if (messages.length === 0 && !loading) {
    return (
      <div className="flex flex-col gap-6">
        <HealthAnalyzerHeader />

        <HealthDataPanel
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onReset={handleReset}
          loading={loading}
          collapsed={false}
        />

        {/* 温馨提示 */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center flex-shrink-0">
              <Icon icon="healthicons:info" className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-white mb-1">温馨提示</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                录入您的健康数据后，AI 将为您提供个性化的健康分析和建议。
                分析完成后，您可以继续追问相关问题，AI 会结合您的数据进行深入解答。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 对话状态
  return (
    <>
      <div className="flex flex-col gap-4 h-[calc(100vh-180px)] min-h-[600px]">
        <HealthAnalyzerHeader />

        {/* 对话区域 */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* 对话消息列表 */}
          <HealthChatMessageList
            messages={messages}
            className="flex-1 min-h-0 rounded-xl border border-white/10 bg-white/5"
            onDataUpdate={handleDataUpdate}
            onDataSubmit={handleDataSubmit}
            loading={loading}
          />

          {/* 错误提示 */}
          {error && messages.length === 0 && (
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
              placeholder={hasSession ? "继续提问..." : "请先提交健康数据..."}
              suggestedQuestions={suggestedQuestions}
            />
          </div>
        </div>
      </div>

      {/* 提示文字 */}
      <div className="text-xs text-white/40 text-center mt-2">
        AI 分析结果仅供参考
      </div>
    </>
  );
}
