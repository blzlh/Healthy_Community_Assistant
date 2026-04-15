/**
 * 健康分析 - 数据录入组件
 * 
 * 用户使用流程：
 * 1. 录入健康数据 → 点击"开始分析"
 * 2. 跳转到自由对话页面进行 AI 分析
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { HealthFormData } from "./types";
import { HealthDataPanel } from "./HealthDataPanel";
import { HealthAnalyzerHeader } from "./HealthAnalyzerHeader";
import { useHealthStore } from "@/store/health-store";

export function HealthAnalyzerContainer() {
  const router = useRouter();
  const setPendingHealthData = useHealthStore((state) => state.setPendingHealthData);
  const reset = useHealthStore((state) => state.reset);

  // 表单数据
  const [formData, setFormData] = useState<HealthFormData>({
    bloodPressure: '',
    heartRate: '',
    bloodSugar: '',
    weight: '',
    height: '',
    age: '',
  });

  // 加载状态（用于按钮显示）
  const [loading, setLoading] = useState(false);

  /**
   * 处理输入变化
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  /**
   * 提交分析 - 跳转到 chat 页面
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 检查是否至少填写了一项数据
    const hasData = Object.values(formData).some(v => v.trim() !== '');
    if (!hasData) {
      alert('请至少填写一项健康数据');
      return;
    }

    setLoading(true);
    
    // 先将健康数据存入 store
    setPendingHealthData(formData);
    
    // 重置其他 store 状态（但保留 pendingHealthData）
    useHealthStore.setState({
      messages: [],
      sessionId: null,
      currentConversationId: null,
      newConversation: null,
      loading: false,
      analyzing: false,
      error: null,
    });
    
    // 跳转到 chat 页面
    router.push('/healthAnalyzer/chat');
  }, [formData, router, setPendingHealthData]);

  /**
   * 重置表单
   */
  const handleReset = useCallback(() => {
    setFormData({
      bloodPressure: '',
      heartRate: '',
      bloodSugar: '',
      weight: '',
      height: '',
      age: '',
    });
  }, []);

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
