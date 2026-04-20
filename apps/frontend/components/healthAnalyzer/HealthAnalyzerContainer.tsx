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
import { PageHeader } from "@/components/ui/PageHeader";
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
    <div className="flex flex-col h-full">
      <PageHeader
        title="健康数据分析"
        description="录入健康数据，获取 AI 分析报告"
        icon="solar:health-bold"
        iconColor="text-emerald-400"
        iconBgGradient="from-emerald-500/20 to-emerald-500/5"
        backHref="/healthAnalyzer"
      />

      <div className="flex-1 flex gap-4 min-h-0 p-4 bg-[#0A0A0A] border border-[#292929] rounded-md mx-4 mb-4">
        <div className="flex-1 flex flex-col">
          <HealthDataPanel
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onReset={handleReset}
            loading={loading}
            collapsed={false}
            className="flex-1"
          />
        </div>

        {/* 右侧：说明信息 */}
        <div className="w-80 flex-shrink-0 hidden lg:flex flex-col gap-4">
          {/* 功能说明 */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500/20 to-sky-500/5 border border-sky-500/20 flex items-center justify-center">
                <Icon icon="solar:stethoscope-bold" className="w-4 h-4 text-sky-400" />
              </div>
              <h4 className="text-sm font-medium text-white">AI 智能分析</h4>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              录入您的健康数据后，AI 将为您提供个性化的健康分析和建议。
            </p>
          </div>

          {/* 温馨提示 */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Icon icon="solar:info-circle-bold" className="w-4 h-4 text-emerald-400" />
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
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Icon icon="solar:shield-check-bold" className="w-4 h-4 text-purple-400" />
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
