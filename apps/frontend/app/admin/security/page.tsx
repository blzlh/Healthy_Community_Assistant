/**
 * 安全监控页面 - 管理员查看安全事件
 */

"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useSecurity } from "@/hooks/use-security";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Skeleton } from "antd";
import { cn } from "@/lib/utils";

// 统计卡片组件
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            color
          )}
        >
          <Icon icon={icon} className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-white/60">{title}</div>
        </div>
      </div>
    </div>
  );
}

// 安全事件类型标签
const eventTypeLabels: Record<string, string> = {
  brute_force: "暴力破解",
  api_abuse: "接口滥用",
  spam: "刷屏",
  ip_blocked: "IP封禁",
};

// 严重程度标签
const severityLabels: Record<string, { label: string; color: string }> = {
  low: { label: "低", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  medium: { label: "中", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  high: { label: "高", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  critical: { label: "严重", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

export default function SecurityPage() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const isAdmin = useAuthStore((state) => state.user)?.isAdmin;

  const {
    statistics,
    loginAttempts,
    blockedIps,
    securityLogs,
    loadingStatistics,
    loadingAttempts,
    loadingBlockedIps,
    loadingLogs,
    error,
    loadStatistics,
    loadLoginAttempts,
    loadBlockedIps,
    loadSecurityLogs,
    handleUnblockIp,
    handleResolveEvent,
  } = useSecurity();

  // Tab 状态
  const [activeTab, setActiveTab] = useState<"overview" | "logs" | "blocked">("overview");

  // 封禁IP表单
  const [blockIpForm, setBlockIpForm] = useState({
    ipAddress: "",
    reason: "",
    durationMinutes: 60,
  });

  // 初始化加载
  useEffect(() => {
    if (hydrated && isAdmin) {
      loadStatistics();
      loadLoginAttempts({ limit: 50 });
      loadBlockedIps(50);
      loadSecurityLogs({ limit: 50 });
    }
  }, [hydrated, isAdmin, loadStatistics, loadLoginAttempts, loadBlockedIps, loadSecurityLogs]);

  // 刷新数据
  const handleRefresh = () => {
    loadStatistics();
    loadLoginAttempts({ limit: 50 });
    loadBlockedIps(50);
    loadSecurityLogs({ limit: 50 });
  };

  // 解封IP
  const handleUnblock = async (ipAddress: string) => {
    if (confirm(`确定要解封 IP ${ipAddress} 吗？`)) {
      const result = await handleUnblockIp(ipAddress);
      if (result.ok) {
        alert("解封成功");
      } else {
        alert(result.message || "解封失败");
      }
    }
  };

  // 解决事件
  const handleResolve = async (logId: string) => {
    if (confirm("确定要标记此事件为已解决吗？")) {
      const result = await handleResolveEvent(logId);
      if (result.ok) {
        alert("已标记为已解决");
      } else {
        alert(result.message || "操作失败");
      }
    }
  };

  // 格式化时间
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("zh-CN");
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
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="!border-white/20 !bg-white/5 !text-white hover:!bg-white/10"
          >
            <Icon icon="lucide:refresh-cw" className="w-4 h-4 mr-2" />
            刷新数据
          </Button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
            {error}
          </div>
        )}

        {/* Tab 导航 */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
          {[
            { key: "overview", label: "概览", icon: "lucide:layout-dashboard" },
            { key: "logs", label: "安全事件", icon: "lucide:shield-alert" },
            { key: "blocked", label: "封禁IP", icon: "lucide:ban" },
          ].map((tab) => (
            <Button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                "!border-white/20 !text-white",
                activeTab === tab.key
                  ? "!bg-white/10 !border-white/30"
                  : "!bg-transparent hover:!bg-white/5"
              )}
              variant="outline"
            >
              <Icon icon={tab.icon} className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* 概览 Tab */}
        {activeTab === "overview" && (
          <div>
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {loadingStatistics ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5">
                      <Skeleton.Input active size="large" style={{ width: "100%", height: 70 }} />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <StatCard
                    title="今日登录失败"
                    value={statistics?.todayFailedAttempts || 0}
                    icon="lucide:alert-triangle"
                    color="bg-orange-500/20"
                  />
                  <StatCard
                    title="封禁IP数"
                    value={statistics?.activeBlockedIps || 0}
                    icon="lucide:ban"
                    color="bg-red-500/20"
                  />
                  <StatCard
                    title="今日安全事件"
                    value={statistics?.todaySecurityEvents || 0}
                    icon="lucide:shield-alert"
                    color="bg-yellow-500/20"
                  />
                  <StatCard
                    title="暴力破解检测"
                    value={statistics?.bruteForceDetections || 0}
                    icon="lucide:user-x"
                    color="bg-purple-500/20"
                  />
                </>
              )}
            </div>

            {/* 最近登录失败 */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon icon="lucide:alert-circle" className="w-5 h-5 text-orange-400" />
                最近登录失败记录
              </h2>
              {loadingAttempts ? (
                <Skeleton active />
              ) : loginAttempts.length === 0 ? (
                <div className="text-center py-8 text-white/40">暂无登录失败记录</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-white/60">IP地址</th>
                        <th className="text-left py-3 px-4 text-white/60">邮箱</th>
                        <th className="text-left py-3 px-4 text-white/60">失败原因</th>
                        <th className="text-left py-3 px-4 text-white/60">时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loginAttempts.slice(0, 10).map((attempt) => (
                        <tr key={attempt.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4 font-mono">{attempt.ipAddress}</td>
                          <td className="py-3 px-4">{attempt.email || "-"}</td>
                          <td className="py-3 px-4 text-red-400">{attempt.failureReason || "-"}</td>
                          <td className="py-3 px-4 text-white/60">{formatTime(attempt.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 安全事件 Tab */}
        {activeTab === "logs" && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon icon="lucide:shield-alert" className="w-5 h-5 text-yellow-400" />
              安全事件日志
            </h2>
            {loadingLogs ? (
              <Skeleton active />
            ) : securityLogs.length === 0 ? (
              <div className="text-center py-8 text-white/40">暂无安全事件</div>
            ) : (
              <div className="space-y-3">
                {securityLogs.map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      "p-4 rounded-lg border",
                      log.resolved
                        ? "border-green-500/20 bg-green-500/5"
                        : "border-white/10 bg-white/5"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={cn(
                              "px-2 py-1 rounded text-xs border",
                              severityLabels[log.severity]?.color || ""
                            )}
                          >
                            {severityLabels[log.severity]?.label || log.severity}
                          </span>
                          <span className="font-medium">
                            {eventTypeLabels[log.type] || log.type}
                          </span>
                          {log.resolved && (
                            <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                              已解决
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-white/60">
                          {log.ipAddress && (
                            <span className="mr-4">IP: {log.ipAddress}</span>
                          )}
                          {log.endpoint && <span className="mr-4">接口: {log.endpoint}</span>}
                          <span>动作: {log.actionTaken || "-"}</span>
                        </div>
                        <div className="text-xs text-white/40 mt-1">
                          {formatTime(log.createdAt)}
                        </div>
                      </div>
                      {!log.resolved && (
                        <Button
                          size="sm"
                          onClick={() => handleResolve(log.id)}
                          className="!bg-green-600 !text-white hover:!bg-green-500"
                        >
                          标记解决
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 封禁IP Tab */}
        {activeTab === "blocked" && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon icon="lucide:ban" className="w-5 h-5 text-red-400" />
              封禁IP列表
            </h2>

            {/* 手动封禁表单 */}
            <div className="mb-6 p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="text-sm font-medium mb-3">手动封禁IP</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input
                  placeholder="IP地址"
                  value={blockIpForm.ipAddress}
                  onChange={(e) => setBlockIpForm({ ...blockIpForm, ipAddress: e.target.value })}
                  className="!bg-white/5 !border-white/10 !text-white"
                />
                <Input
                  placeholder="原因"
                  value={blockIpForm.reason}
                  onChange={(e) => setBlockIpForm({ ...blockIpForm, reason: e.target.value })}
                  className="!bg-white/5 !border-white/10 !text-white"
                />
                <Input
                  type="number"
                  placeholder="封禁时长(分钟)"
                  value={blockIpForm.durationMinutes}
                  onChange={(e) =>
                    setBlockIpForm({ ...blockIpForm, durationMinutes: parseInt(e.target.value) || 60 })
                  }
                  className="!bg-white/5 !border-white/10 !text-white"
                />
                <Button className="!bg-red-600 !text-white hover:!bg-red-500">
                  <Icon icon="lucide:ban" className="w-4 h-4 mr-2" />
                  封禁
                </Button>
              </div>
            </div>

            {loadingBlockedIps ? (
              <Skeleton active />
            ) : blockedIps.length === 0 ? (
              <div className="text-center py-8 text-white/40">暂无封禁IP</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/60">IP地址</th>
                      <th className="text-left py-3 px-4 text-white/60">原因</th>
                      <th className="text-left py-3 px-4 text-white/60">类型</th>
                      <th className="text-left py-3 px-4 text-white/60">过期时间</th>
                      <th className="text-left py-3 px-4 text-white/60">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockedIps.map((ban) => (
                      <tr key={ban.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 font-mono">{ban.ipAddress}</td>
                        <td className="py-3 px-4">{ban.reason}</td>
                        <td className="py-3 px-4">
                          <span
                            className={cn(
                              "px-2 py-1 rounded text-xs",
                              ban.autoBlocked
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-blue-500/20 text-blue-400"
                            )}
                          >
                            {ban.autoBlocked ? "自动封禁" : "手动封禁"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white/60">{formatTime(ban.expiresAt)}</td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnblock(ban.ipAddress)}
                            className="!border-green-500/30 !text-green-400 hover:!bg-green-500/10"
                          >
                            解封
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
