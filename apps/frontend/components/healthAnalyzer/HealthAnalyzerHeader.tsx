/**
 * 健康分析 - 头部组件
 * 复用通用 PageHeader 组件
 */

import { PageHeader } from "@/components/ui/PageHeader";

interface HealthAnalyzerHeaderProps {
  title?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  iconBgGradient?: string;
}

export function HealthAnalyzerHeader({
  title = "AI 智能健康分析",
  description = "输入您的健康数据，我将为您提供专业的分析报告和个性化健康建议",
  icon = "solar:stethoscope-bold",
  iconColor = "text-sky-400",
  iconBgGradient = "from-sky-500/20 to-emerald-500/20",
}: HealthAnalyzerHeaderProps) {
  return (
    <PageHeader
      title={title}
      description={description}
      icon={icon}
      iconColor={iconColor}
      iconBgGradient={iconBgGradient}
      backHref="/healthAnalyzer"
    />
  );
}
