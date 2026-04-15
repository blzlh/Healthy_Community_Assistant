/**
 * WebSocket 事件日志列表组件
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Icon } from "@iconify/react";
import { Tag, Skeleton, Empty, ConfigProvider } from "antd";

interface WebsocketEvent {
  id: string;
  eventType: string;
  socketId: string;
  userId: string | null;
  userName: string | null;
  ipAddress: string | null;
  roomId: string | null;
  messagePreview: string | null;
  messageCount: string | null;
  reason: string | null;
  createdAt: string;
}

interface WebSocketEventsListProps {
  events: WebsocketEvent[];
  loading: boolean;
}

const eventTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
  connect: { label: "连接", color: "green", icon: "lucide:plug" },
  disconnect: { label: "断开", color: "orange", icon: "lucide:plug-zap" },
  spam_detected: { label: "刷屏", color: "red", icon: "lucide:alert-triangle" },
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

export function WebSocketEventsList({ events, loading }: WebSocketEventsListProps) {
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
          WebSocket 事件日志
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ConfigProvider theme={darkTheme}>
          {events.length === 0 ? (
            <Empty
              description={<span style={{ color: "rgba(255, 255, 255, 0.4)" }}>暂无事件记录</span>}
              style={{ padding: "2rem 0" }}
            />
          ) : (
            <div className="space-y-3">
              {events.map((event) => {
                const typeConfig = eventTypeConfig[event.eventType] || {
                  label: event.eventType,
                  color: "default",
                  icon: "lucide:circle",
                };

                const isSpam = event.eventType === "spam_detected";

                return (
                  <div
                    key={event.id}
                    className="flex items-start justify-between p-4 rounded-lg border border-white/10"
                    style={{
                      backgroundColor: isSpam ? "rgba(239, 68, 68, 0.05)" : "transparent",
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag color={typeConfig.color} className="!flex items-center gap-1 ">
                          <Icon icon={typeConfig.icon} className="w-3.5 h-3.5" />
                          {typeConfig.label}
                        </Tag>
                        <div className="text-sm text-white/60 flex flex-wrap gap-x-4 gap-y-1">
                          {event.userName && (
                            <span>
                              用户: <span className="text-white/80">{event.userName}</span>
                            </span>
                          )}
                          {event.roomId && (
                            <span>
                              房间: <span className="text-white/80">{event.roomId}</span>
                            </span>
                          )}
                          {isSpam && event.messageCount && (
                            <span>
                              消息数: <span className="text-white/80">{event.messageCount}</span>
                            </span>
                          )}
                          {event.ipAddress && (
                            <span>
                              IP: <span className="text-white/80 font-mono">{event.ipAddress}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      {event.reason && (
                        <div className="text-xs text-red-400 mt-1">
                          原因: {event.reason}
                        </div>
                      )}
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
