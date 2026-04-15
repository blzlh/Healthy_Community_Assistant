/**
 * 安全监控容器组件 - 整合所有安全监控子组件
 */

"use client";

import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/shadcn/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tab";
import { useSecurity } from "@/hooks/use-security";
import { useAuthStore } from "@/store/auth-store";
import { App } from "antd";

import { SecurityOverview } from "./SecurityOverview";
import { SecurityLogsList } from "./SecurityLogsList";
import { BlockedIpList } from "./BlockedIpList";
import { BlockIpForm } from "./BlockIpForm";
import { WebSocketEventsList } from "./WebSocketEventsList";
import { ApiAbuseEventsList } from "./ApiAbuseEventsList";

// Tab 配置
const TAB_CONFIG = [
  {
    value: "overview",
    icon: "lucide:layout-dashboard",
    label: "概览",
  },
  {
    value: "api-abuse",
    icon: "lucide:zap",
    label: "接口滥用",
  },
  {
    value: "websocket",
    icon: "lucide:activity",
    label: "WebSocket",
  },
  {
    value: "logs",
    icon: "lucide:shield-alert",
    label: "安全事件",
  },
  {
    value: "blocked",
    icon: "lucide:ban",
    label: "封禁IP",
  },
] as const;

export function SecurityContainer() {
  const { message } = App.useApp();
  const hydrated = useAuthStore((state) => state.hydrated);
  const isAdmin = useAuthStore((state) => state.user)?.isAdmin;

  const {
    statistics,
    loginAttempts,
    blockedIps,
    securityLogs,
    websocketEvents,
    apiAbuseEvents,
    loadingStatistics,
    loadingAttempts,
    loadingBlockedIps,
    loadingLogs,
    loadingWebsocketEvents,
    loadingApiAbuseEvents,
    error,
    loadStatistics,
    loadLoginAttempts,
    loadBlockedIps,
    loadSecurityLogs,
    loadWebsocketEvents,
    loadApiAbuseEvents,
    handleUnblockIp,
    handleResolveEvent,
    handleBlockIp,
  } = useSecurity();

  // 加载数据的函数列表
  const loadAllData = () => {
    loadStatistics();
    loadLoginAttempts({ limit: 50 });
    loadBlockedIps(50);
    loadSecurityLogs({ limit: 50 });
    loadWebsocketEvents({ limit: 50 });
    loadApiAbuseEvents({ limit: 50 });
  };

  // 初始化加载
  useEffect(() => {
    if (hydrated && isAdmin) {
      loadAllData();
    }
  }, [hydrated, isAdmin, loadStatistics, loadLoginAttempts, loadBlockedIps, loadSecurityLogs, loadWebsocketEvents, loadApiAbuseEvents]);

  // 刷新数据
  const handleRefresh = () => {
    loadAllData();
    message.success("数据已刷新");
  };

  // 解封IP
  const onUnblock = async (ipAddress: string) => {
    const result = await handleUnblockIp(ipAddress);
    if (result.ok) {
      message.success("解封成功");
    } else {
      message.error(result.message || "解封失败");
    }
  };

  // 解决事件
  const onResolve = async (logId: string) => {
    const result = await handleResolveEvent(logId);
    if (result.ok) {
      message.success("已标记为已解决");
    } else {
      message.error(result.message || "操作失败");
    }
  };

  // 封禁IP
  const onBlockIp = async (data: { ipAddress: string; reason: string; durationMinutes: number }) => {
    const result = await handleBlockIp(data);
    if (!result.ok) {
      throw new Error(result.message);
    }
  };

  // 未授权检查
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white/60">加载中...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon icon="lucide:shield-x" className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">需要管理员权限</h2>
          <p className="text-white/60">您没有权限访问此页面</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">安全监控中心</h1>
            <p className="text-white/60 mt-1">监控安全事件、封禁IP、查看登录日志</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={process.env.NEXT_PUBLIC_KIBANA_URL || "http://localhost:5601"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors text-sm"
            >
              <Icon icon="lucide:bar-chart-3" className="w-4 h-4" />
              Kibana 日志分析
              <Icon icon="lucide:external-link" className="w-3 h-3" />
            </a>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="!border-white/20 !bg-white/5 !text-white hover:!bg-white/10"
            >
              <Icon icon="lucide:refresh-cw" className="w-4 h-4 mr-2" />
              刷新数据
            </Button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
            {error}
          </div>
        )}

        {/* Tab 导航 */}
        <Tabs defaultValue="overview" className="w-full ">
          <TabsList className="mb-6 gap-1">
            {TAB_CONFIG.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="hover:bg-zinc-800 cursor-pointer">
                <Icon icon={tab.icon} className="w-4 h-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <SecurityOverview
              statistics={statistics}
              loginAttempts={loginAttempts}
              loadingStatistics={loadingStatistics}
              loadingAttempts={loadingAttempts}
            />
          </TabsContent>

          <TabsContent value="api-abuse">
            <ApiAbuseEventsList
              events={apiAbuseEvents}
              loading={loadingApiAbuseEvents}
            />
          </TabsContent>

          <TabsContent value="websocket">
            <WebSocketEventsList
              events={websocketEvents}
              loading={loadingWebsocketEvents}
            />
          </TabsContent>

          <TabsContent value="logs">
            <SecurityLogsList
              logs={securityLogs}
              loading={loadingLogs}
              onResolve={onResolve}
            />
          </TabsContent>

          <TabsContent value="blocked">
            <BlockIpForm onSubmit={onBlockIp} />
            <BlockedIpList
              blockedIps={blockedIps}
              loading={loadingBlockedIps}
              onUnblock={onUnblock}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
