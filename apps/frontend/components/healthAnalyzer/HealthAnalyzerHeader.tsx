/**
 * 健康分析 - 头部组件
 */

import { Icon } from "@iconify/react";

export function HealthAnalyzerHeader() {
  return (
    <section className="flex flex-col gap-4">
      <div className="text-3xl font-semibold leading-tight">
        AI 智能健康分析
      </div>
      <div className="text-white/60">
        输入您的健康数据，我将为您提供专业的分析报告和个性化健康建议
      </div>
    </section>
  );
}
