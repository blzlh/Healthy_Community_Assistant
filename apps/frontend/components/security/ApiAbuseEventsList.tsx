/**
 * 接口滥用事件列表组件
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Icon } from "@iconify/react";
import { Tag, Skeleton, Empty, ConfigProvider } from "antd";

interface ApiAbuseEvent {
  id: string;
  endpoint: string;
  method: string;
  ipAddress: string;
  userId: string | null;
  userName: string | null;
  qps: string;
  duration: string;
  actionTaken: string;
  rateLimitDuration: string | null;
  createdAt: string;
}

interface ApiAbuseEventsListProps {
  events: ApiAbuseEvent[];
  loading: boolean;
}

const methodConfig: Record<string, { color: string }> = {
  GET: { color: "green" },
  POST: { color: "blue" },
  PUT: { color: "orange" },
  DELETE: { color: "red" },
  PATCH: { color: "purple" },
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
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
};

export function ApiAbuseEventsList({ events, loading }: ApiAbuseEventsListProps) {
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
          <Icon icon="lucide:zap" className="w-5 h-5 text-yellow-400" />
          接口滥用事件日志
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ConfigProvider theme={darkTheme}>
          {events.length === 0 ? (
            <Empty
              description={<span style={{ color: "rgba(255, 255, 255, 0.4)" }}>暂无接口滥用事件</span>}
              style={{ padding: "2rem 0" }}
            />
          ) : (
            <div className="space-y-3">
              {events.map((event) => {
                const methodStyle = methodConfig[event.method] || { color: "default" };

                return (
                  <div
                    key={event.id}
                    className="flex items-start justify-between p-4 rounded-lg border border-white/10 bg-red-500/5"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag color="red" className="flex items-center gap-1">
                          <Icon icon="lucide:alert-triangle" className="w-3.5 h-3.5" />
                          滥用
                        </Tag>
                        <Tag color={methodStyle.color}>{event.method}</Tag>
                      </div>
                      <div className="text-sm text-white/60 flex flex-wrap gap-x-4 gap-y-1">
                        <span className="text-white/80 font-mono text-xs">
                          {event.endpoint}
                        </span>
                      </div>
                      <div className="text-sm text-white/60 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <span>
                          QPS: <span className="text-red-400 font-semibold">{event.qps}</span>
                        </span>
                        <span>
                          持续: <span className="text-white/80">{event.duration}秒</span>
                        </span>
                        {event.userName && (
                          <span>
                            用户: <span className="text-white/80">{event.userName}</span>
                          </span>
                        )}
                        <span>
                          IP: <span className="text-white/80 font-mono">{event.ipAddress}</span>
                        </span>
                        {event.rateLimitDuration && (
                          <span>
                            限流: <span className="text-orange-400">{event.rateLimitDuration}秒</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-white/40 mt-1">
                        {formatTime(event.createdAt)}
                      </div>
                    </div>
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
