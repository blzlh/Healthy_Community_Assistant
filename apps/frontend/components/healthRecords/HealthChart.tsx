/**
 * 健康数据图表组件
 */

"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Icon } from "@iconify/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/shadcn/tab";
import { cn } from "@/lib/utils";
import type { HealthRecord } from "@/services/health-records";
import { METRIC_CONFIGS, type HealthMetricType } from "./types";

interface HealthChartProps {
  records: HealthRecord[];
  selectedMetric?: HealthMetricType;
  onMetricChange?: (metric: HealthMetricType) => void;
  className?: string;
}

/**
 * 解析血压值，返回收缩压（高压）
 */
function parseBloodPressure(value: string | null): number | null {
  if (!value) return null;
  const match = value.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * 格式化日期显示
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * 格式化完整日期
 */
function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function HealthChart({
  records,
  selectedMetric = "heartRate",
  onMetricChange,
  className,
}: HealthChartProps) {
  // 根据 metric 类型提取数据
  const chartData = useMemo(() => {
    const data: { date: string; value: number; fullDate: string }[] = [];

    records.forEach((record) => {
      let value: number | null = null;

      switch (selectedMetric) {
        case "heartRate":
          value = record.heartRate ? parseFloat(record.heartRate) : null;
          break;
        case "bloodPressure":
          value = parseBloodPressure(record.bloodPressure);
          break;
        case "bloodSugar":
          value = record.bloodSugar ? parseFloat(record.bloodSugar) : null;
          break;
        case "weight":
          value = record.weight ? parseFloat(record.weight) : null;
          break;
      }

      if (value !== null && !isNaN(value)) {
        data.push({
          date: formatDate(record.createdAt),
          value,
          fullDate: formatFullDate(record.createdAt),
        });
      }
    });

    // 按日期排序
    return data.sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [records, selectedMetric]);

  // 获取当前 metric 配置
  const currentConfig = METRIC_CONFIGS.find((m) => m.key === selectedMetric)!;

  // ECharts 配置
  const chartOption = useMemo(() => {
    return {
      tooltip: {
        trigger: "axis" as const,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        textStyle: {
          color: "#fff",
        },
        formatter: (params: { data: { fullDate: string; value: number } }[]) => {
          if (!params || params.length === 0) return "";
          const { fullDate, value } = params[0].data;
          return `<div style="padding: 4px 8px;">
            <div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-bottom: 4px;">${fullDate}</div>
            <div style="font-size: 14px; font-weight: 500;">
              <span style="color: ${currentConfig.color};">●</span> ${currentConfig.label}: ${value} ${currentConfig.unit}
            </div>
          </div>`;
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category" as const,
        data: chartData.map((d) => d.date),
        axisLine: {
          lineStyle: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
        axisLabel: {
          color: "rgba(255, 255, 255, 0.5)",
          fontSize: 11,
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: "value" as const,
        min: currentConfig.minValue,
        max: currentConfig.maxValue,
        splitLine: {
          lineStyle: {
            color: "rgba(255, 255, 255, 0.05)",
          },
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          color: "rgba(255, 255, 255, 0.5)",
          fontSize: 11,
        },
      },
      series: [
        {
          name: currentConfig.label,
          type: "line" as const,
          data: chartData,
          smooth: true,
          symbol: "circle",
          symbolSize: 8,
          lineStyle: {
            color: currentConfig.color,
            width: 3,
          },
          itemStyle: {
            color: currentConfig.color,
            borderColor: "#000",
            borderWidth: 2,
          },
          areaStyle: {
            color: {
              type: "linear" as const,
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: currentConfig.color + "40" },
                { offset: 1, color: currentConfig.color + "00" },
              ],
            },
          },
        },
      ],
    };
  }, [chartData, currentConfig]);

  // 统计数据
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    const values = chartData.map((d) => d.value);
    const latest = values[values.length - 1];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    return { latest, avg, max, min, count: values.length };
  }, [chartData]);

  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent overflow-hidden flex flex-col",
        className
      )}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center">
            <Icon icon="solar:chart-2-bold" className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-medium text-white">数据趋势</span>
        </div>
        <span className="text-xs text-white/40">
          {stats ? `共 ${stats.count} 条记录` : "暂无数据"}
        </span>
      </div>

      {/* 指标选择 */}
      <div className="px-4 pt-3">
        <Tabs value={selectedMetric} onValueChange={(v) => onMetricChange?.(v as HealthMetricType)}>
          <TabsList className="bg-black/30 border border-white/10">
            {METRIC_CONFIGS.map((config) => (
              <TabsTrigger
                key={config.key}
                value={config.key}
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white"
              >
                <Icon icon={config.icon} className="w-3.5 h-3.5 mr-1" style={{ color: config.color }} />
                <span className="text-xs">{config.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* 图表 */}
      <div className="p-4 flex-1 flex flex-col">
        {chartData.length > 0 ? (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 min-h-[280px]">
              <ReactECharts
                option={chartOption}
                style={{ height: "100%", minHeight: 280 }}
                opts={{ renderer: "canvas" }}
              />
            </div>

            {/* 统计数据 */}
            {stats && (
              <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/10">
                <div className="text-center">
                  <div className="text-xs text-white/40 mb-1">最新值</div>
                  <div className="text-sm font-medium text-white">{stats.latest.toFixed(1)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-white/40 mb-1">平均值</div>
                  <div className="text-sm font-medium text-white">{stats.avg.toFixed(1)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-white/40 mb-1">最大值</div>
                  <div className="text-sm font-medium text-emerald-400">{stats.max.toFixed(1)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-white/40 mb-1">最小值</div>
                  <div className="text-sm font-medium text-rose-400">{stats.min.toFixed(1)}</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-[280px] flex flex-col items-center justify-center text-white/40">
            <Icon icon="solar:chart-2-bold" className="w-12 h-12 mb-2 opacity-50" />
            <span className="text-sm">暂无{currentConfig.label}数据</span>
            <span className="text-xs mt-1">添加记录后即可查看趋势图</span>
          </div>
        )}
      </div>
    </div>
  );
}
