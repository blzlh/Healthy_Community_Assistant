/**
 * 健康记录列表组件
 */

"use client";

import { Icon } from "@iconify/react";
import { Button, Popconfirm, Empty, Spin } from "antd";
import { cn } from "@/lib/utils";
import type { HealthRecord } from "@/services/health-records";

interface HealthRecordListProps {
  records: HealthRecord[];
  loading?: boolean;
  onEdit?: (record: HealthRecord) => void;
  onDelete?: (recordId: string) => void;
  className?: string;
}

/**
 * 格式化日期时间
 */
function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/**
 * 格式化相对时间
 */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 1 ? "刚刚" : `${minutes} 分钟前`;
    }
    return `${hours} 小时前`;
  } else if (days === 1) {
    return "昨天";
  } else if (days < 7) {
    return `${days} 天前`;
  } else {
    return formatDateTime(dateStr);
  }
}

const DATA_FIELDS = [
  { key: "bloodPressure", label: "血压", unit: "mmHg", icon: "healthicons:blood-pressure", color: "text-red-400" },
  { key: "heartRate", label: "心率", unit: "次/分", icon: "lucide:heart-pulse", color: "text-pink-400" },
  { key: "bloodSugar", label: "血糖", unit: "mmol/L", icon: "lucide:droplet", color: "text-blue-400" },
  { key: "weight", label: "体重", unit: "kg", icon: "healthicons:weight", color: "text-amber-400" },
  { key: "height", label: "身高", unit: "cm", icon: "healthicons:body", color: "text-emerald-400" },
  { key: "age", label: "年龄", unit: "岁", icon: "healthicons:calendar", color: "text-purple-400" },
] as const;

export function HealthRecordList({
  records,
  loading = false,
  onEdit,
  onDelete,
  className,
}: HealthRecordListProps) {
  if (loading) {
    return (
      <div className={cn("rounded-xl border border-white/10 bg-white/5 p-8", className)}>
        <div className="flex flex-col items-center justify-center">
          <Spin size="default" />
          <span className="mt-3 text-sm text-white/50">加载中...</span>
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className={cn("rounded-xl border border-white/10 bg-white/5 p-8", className)}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="text-white/40">暂无健康记录</span>
          }
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/5 overflow-hidden flex flex-col",
        className
      )}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Icon icon="lucide:history" className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-medium text-white">历史记录</span>
        </div>
        <span className="text-xs text-white/40">共 {records.length} 条</span>
      </div>

      {/* 记录列表 */}
      <div className="divide-y divide-white/5 flex-1 overflow-y-auto">
        {records.map((record) => {
          const dataFields = DATA_FIELDS.filter(
            (field) => record[field.key as keyof HealthRecord]
          );

          return (
            <div
              key={record.id}
              className="p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                {/* 数据内容 */}
                <div className="flex-1 min-w-0">
                  {/* 时间 */}
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-xs text-white/50">
                      {formatRelativeTime(record.createdAt)}
                    </span>
                  </div>

                  {/* 健康数据 */}
                  <div className="flex flex-wrap gap-2">
                    {dataFields.map((field) => (
                      <div
                        key={field.key}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/30 border border-white/5"
                      >
                        <Icon icon={field.icon} className={cn("w-3.5 h-3.5", field.color)} />
                        <span className="text-xs text-white/60">{field.label}:</span>
                        <span className="text-xs font-medium text-white">
                          {record[field.key as keyof HealthRecord]}
                        </span>
                        <span className="text-[10px] text-white/40">{field.unit}</span>
                      </div>
                    ))}
                  </div>

                  {/* 备注 */}
                  {record.notes && (
                    <div className="mt-2 flex items-start gap-1.5">
                      <Icon icon="lucide:file-text" className="w-3.5 h-3.5 text-white/40 mt-0.5" />
                      <span className="text-xs text-white/50">{record.notes}</span>
                    </div>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-1 shrink-0">
                  {onEdit && (
                    <Button
                      type="text"
                      size="small"
                      onClick={() => onEdit(record)}
                      className="!text-white/50 hover:!text-white hover:!bg-white/10"
                      title="编辑"
                    >
                      <Icon icon="lucide:pencil" className="w-4 h-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Popconfirm
                      title="确定删除这条记录吗？"
                      description="删除后无法恢复"
                      onConfirm={() => onDelete(record.id)}
                      okText="删除"
                      cancelText="取消"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        type="text"
                        size="small"
                        className="!text-white/50 hover:!text-red-400 hover:!bg-white/10"
                        title="删除"
                      >
                        <Icon icon="lucide:trash-2" className="w-4 h-4" />
                      </Button>
                    </Popconfirm>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
