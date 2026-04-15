/**
 * 健康分析 - 数据面板组件（可折叠）
 */

"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "antd";
import { HealthFormData, HealthFieldConfig } from "./types";
import { cn } from "@/lib/utils";

interface HealthDataPanelProps {
  formData: HealthFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset?: () => void;
  loading?: boolean;
  /** 是否折叠状态 */
  collapsed?: boolean;
  /** 折叠状态变化回调 */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** 是否显示为紧凑模式（侧边栏） */
  compact?: boolean;
  className?: string;
}

/**
 * 健康指标字段配置
 */
const HEALTH_FIELDS: HealthFieldConfig[] = [
  {
    name: "bloodPressure",
    label: "血压",
    placeholder: "如: 120/80",
    unit: "mmHg",
    icon: "healthicons:blood-pressure",
    iconColor: "text-red-400",
  },
  {
    name: "heartRate",
    label: "心率",
    placeholder: "如: 72",
    unit: "次/分钟",
    icon: "lucide:heart-pulse",
    iconColor: "text-pink-400",
  },
  {
    name: "bloodSugar",
    label: "空腹血糖",
    placeholder: "如: 5.5",
    unit: "mmol/L",
    icon: "lucide:droplet",
    iconColor: "text-blue-400",
  },
  {
    name: "weight",
    label: "体重",
    placeholder: "如: 70",
    unit: "kg",
    icon: "healthicons:weight",
    iconColor: "text-amber-400",
  },
  {
    name: "height",
    label: "身高",
    placeholder: "如: 175",
    unit: "cm",
    icon: "healthicons:body",
    iconColor: "text-emerald-400",
  },
  {
    name: "age",
    label: "年龄",
    placeholder: "如: 30",
    unit: "岁",
    icon: "healthicons:calendar",
    iconColor: "text-purple-400",
  },
];

/**
 * 折叠状态下的数据预览
 */
function CollapsedPreview({
  formData,
  onExpand,
  hasSession
}: {
  formData: HealthFormData;
  onExpand: () => void;
  hasSession: boolean;
}) {
  const filledFields = HEALTH_FIELDS.filter(f => formData[f.name]);

  return (
    <div className="p-3 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
          <Icon icon="healthicons:clipboard-text" className="w-4 h-4 text-sky-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">健康数据</span>
            {hasSession && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                已录入
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
            {filledFields.length > 0 ? (
              filledFields.map((field) => (
                <span key={field.name} className="text-xs text-white/50 whitespace-nowrap">
                  {field.label}: <span className="text-white/70">{formData[field.name]}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-white/40">点击展开录入数据</span>
            )}
          </div>
        </div>
      </div>
      <Button
        type="text"
        onClick={onExpand}
        className="shrink-0 !text-white/60 hover:!text-white"
        title="展开数据面板"
      >
        <Icon icon="lucide:chevron-down" className="w-5 h-5" />
      </Button>
    </div>
  );
}

export function HealthDataPanel({
  formData,
  onInputChange,
  onSubmit,
  onReset,
  loading = false,
  collapsed = false,
  onCollapsedChange,
  compact = false,
  className,
}: HealthDataPanelProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(collapsed);
  const isCollapsed = onCollapsedChange ? collapsed : internalCollapsed;

  const handleToggleCollapse = () => {
    if (onCollapsedChange) {
      onCollapsedChange(!collapsed);
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  // 折叠状态
  if (isCollapsed) {
    return (
      <div
        className={cn(
          "rounded-xl border border-white/10 bg-white/5",
          className
        )}
      >
        <CollapsedPreview
          formData={formData}
          onExpand={handleToggleCollapse}
          hasSession={Object.values(formData).some(Boolean)}
        />
      </div>
    );
  }

  // 展开状态 - 紧凑模式（侧边栏）
  if (compact) {
    return (
      <div
        className={cn(
          "rounded-xl border border-white/10 bg-white/5 overflow-hidden",
          className
        )}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Icon icon="healthicons:clipboard-text" className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-medium text-white">健康数据</span>
          </div>
          <Button
            type="text"
            onClick={handleToggleCollapse}
            className="!text-white/60 hover:!text-white"
            title="收起数据面板"
          >
            <Icon icon="lucide:chevron-up" className="w-4 h-4" />
          </Button>
        </div>

        {/* 表单 */}
        <form onSubmit={onSubmit} className="p-3 space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
          {HEALTH_FIELDS.map((field) => (
            <div key={field.name} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-white/60 flex items-center gap-1.5">
                  <Icon icon={field.icon} className={cn("w-3.5 h-3.5", field.iconColor)} />
                  {field.label}
                </label>
                <span className="text-[10px] text-white/40">{field.unit}</span>
              </div>
              <input
                type="text"
                name={field.name}
                value={formData[field.name]}
                onChange={onInputChange}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-sky-500/50 focus:outline-none transition-colors"
              />
            </div>
          ))}

          <div className="flex gap-2 pt-2 sticky bottom-0 bg-white/5 pb-1">
            {onReset && (
              <Button
                type="default"
                onClick={onReset}
                className="flex-1 h-9 !bg-white/5 !text-white/80 !border-white/10 hover:!bg-white/10 hover:!border-white/20"
              >
                清空
              </Button>
            )}
            <Button
              type="primary"
              htmlType="submit"
              disabled={loading}
              loading={loading}
              className="flex-1 h-9 !bg-zinc-800 !text-white hover:!bg-zinc-700 disabled:!opacity-50"
            >
              {loading ? "分析中..." : "开始分析"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // 展开状态 - 完整模式
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/5 overflow-hidden flex flex-col",
        className
      )}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Icon icon="healthicons:clipboard-text" className="w-5 h-5 text-sky-400" />
          <span className="font-medium text-white">数据录入</span>
        </div>
        <span className="text-xs text-white/40">至少填写一项</span>
      </div>

      {/* 表单 */}
      <form onSubmit={onSubmit} className="p-4 flex-1 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {HEALTH_FIELDS.map((field) => (
            <div
              key={field.name}
              className="rounded-lg border border-white/10 bg-black/20 p-3 transition-colors hover:border-white/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon icon={field.icon} className={cn("w-4 h-4", field.iconColor)} />
                <label className="text-sm text-white/70">{field.label}</label>
                <span className="text-xs text-white/40 ml-auto">{field.unit}</span>
              </div>
              <input
                type="text"
                name={field.name}
                value={formData[field.name]}
                onChange={onInputChange}
                placeholder={field.placeholder}
                className="w-full border-b border-white/10 bg-transparent py-1.5 text-white placeholder:text-white/30 focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4 mt-auto">
          <Button
            type="primary"
            htmlType="submit"
            disabled={loading}
            loading={loading}
            className="flex-1 h-11 !bg-zinc-800 !text-white hover:!bg-zinc-700 disabled:!opacity-50"
          >
            {loading ? "分析中..." : "开始 AI 分析"}
          </Button>
          {onReset && (
            <Button
              type="default"
              onClick={onReset}
              className="h-11 px-4 !bg-white/5 !text-white/80 !border-white/10 hover:!bg-white/10 hover:!border-white/20"
            >
              重置
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export { HEALTH_FIELDS };
