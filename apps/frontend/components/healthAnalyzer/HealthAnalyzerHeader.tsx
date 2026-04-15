/**
 * 健康分析 - 头部组件
 */

import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface HealthAnalyzerHeaderProps {
  title?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
}

export function HealthAnalyzerHeader({
  title = "AI 智能健康分析",
  description = "输入您的健康数据，我将为您提供专业的分析报告和个性化健康建议",
  icon = "lucide:heart-pulse",
  iconColor = "text-emerald-400",
}: HealthAnalyzerHeaderProps) {
  return (
    <section className="flex items-center gap-3">
      <div className={cn("w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center", iconColor)}>
        <Icon icon={icon} className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xl font-semibold leading-tight">
          {title}
        </div>
        <div className="text-sm text-white/60">
          {description}
        </div>
      </div>
    </section>
  );
}
