/**
 * 安全事件日志列表组件
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Tag, Skeleton, Empty, ConfigProvider } from "antd";

interface SecurityLog {
  id: string;
  type: string;
  severity: string;
  ipAddress: string | null;
  endpoint: string | null;
  actionTaken: string | null;
  resolved: boolean;
  createdAt: string;
}

interface SecurityLogsListProps {
  logs: SecurityLog[];
  loading: boolean;
  onResolve: (logId: string) => void;
}

const eventTypeLabels: Record<string, string> = {
  brute_force: "暴力破解",
  api_abuse: "接口滥用",
  spam: "刷屏",
  ip_blocked: "IP封禁",
};

const severityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "低", color: "blue" },
  medium: { label: "中", color: "gold" },
  high: { label: "高", color: "orange" },
  critical: { label: "严重", color: "red" },
};

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString("zh-CN");
};

// 暗色主题配置
const darkTheme = {
  token: {
    colorBgContainer: "transparent",
    colorText: "rgba(255, 255, 255, 0.85)",
    colorTextSecondary: "rgba(255, 255, 255, 0.6)",
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
};

// 日志详情字段配置
const LOG_DETAIL_FIELDS = [
  { key: "ipAddress", label: "IP", dataKey: "ipAddress" as const },
  { key: "endpoint", label: "接口", dataKey: "endpoint" as const },
  { key: "action", label: "动作", dataKey: "actionTaken" as const },
];

export function SecurityLogsList({ logs, loading, onResolve }: SecurityLogsListProps) {
  if (loading) {
    return (
      <Card className="!bg-white/5 !border-white/10">
        <CardContent className="p-6">
          <Skeleton active />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="!bg-white/5 !border-white/10">
      <CardHeader>
        <CardTitle className="!text-lg flex items-center gap-2 !text-white">
          安全事件日志
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ConfigProvider theme={darkTheme}>
          {logs.length === 0 ? (
            <Empty
              description={<span style={{ color: "rgba(255, 255, 255, 0.4)" }}>暂无安全事件</span>}
              style={{ padding: "2rem 0" }}
            />
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const severity = severityConfig[log.severity] || {
                  label: log.severity,
                  color: "default",
                };

                return (
                  <div
                    key={log.id}
                    className="flex items-start justify-between p-4 rounded-lg border border-white/10"
                    style={{
                      backgroundColor: log.resolved ? "rgba(34, 197, 94, 0.05)" : "transparent",
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag color={severity.color}>{severity.label}</Tag>
                        <span className="text-white">
                          {eventTypeLabels[log.type] || log.type}
                        </span>
                        {log.resolved && <Tag color="success">已解决</Tag>}
                      </div>
                      <div className="text-sm text-white/60">
                        {LOG_DETAIL_FIELDS.map((field) => {
                          const value = field.dataKey === "actionTaken"
                            ? (log.actionTaken || "-")
                            : log[field.dataKey];
                          if (!value && field.dataKey !== "actionTaken") return null;
                          return (
                            <span key={field.key} className="mr-4">
                              {field.label}: {value}
                            </span>
                          );
                        })}
                      </div>
                      <div className="text-xs text-white/40 mt-1">
                        {formatTime(log.createdAt)}
                      </div>
                    </div>
                    {!log.resolved && (
                      <Button
                        size="sm"
                        onClick={() => onResolve(log.id)}
                        className="!bg-green-600 !text-white hover:!bg-green-500 !h-7 !text-xs"
                      >
                        标记解决
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ConfigProvider>
      </CardContent>
    </Card>
  );
}
