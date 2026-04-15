/**
 * 安全监控 Hook
 */

"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useSecurityStore } from "@/store/security-store";
import {
  getSecurityStatistics,
  getLoginAttempts,
  getBlockedIps,
  blockIp,
  unblockIp,
  checkIpStatus,
  getSecurityLogs,
  resolveSecurityEvent,
} from "@/services/security";

type SecurityResult = {
  ok: boolean;
  message?: string;
};

export function useSecurity() {
  const token = useAuthStore((state) => state.token);

  // Store 状态
  const statistics = useSecurityStore((state) => state.statistics);
  const loginAttempts = useSecurityStore((state) => state.loginAttempts);
  const blockedIps = useSecurityStore((state) => state.blockedIps);
  const securityLogs = useSecurityStore((state) => state.securityLogs);
  const loadingStatistics = useSecurityStore((state) => state.loadingStatistics);
  const loadingAttempts = useSecurityStore((state) => state.loadingAttempts);
  const loadingBlockedIps = useSecurityStore((state) => state.loadingBlockedIps);
  const loadingLogs = useSecurityStore((state) => state.loadingLogs);
  const error = useSecurityStore((state) => state.error);

  // Store 操作
  const setStatistics = useSecurityStore((state) => state.setStatistics);
  const setLoginAttempts = useSecurityStore((state) => state.setLoginAttempts);
  const setBlockedIps = useSecurityStore((state) => state.setBlockedIps);
  const addBlockedIp = useSecurityStore((state) => state.addBlockedIp);
  const removeBlockedIp = useSecurityStore((state) => state.removeBlockedIp);
  const setSecurityLogs = useSecurityStore((state) => state.setSecurityLogs);
  const updateSecurityLog = useSecurityStore((state) => state.updateSecurityLog);
  const setLoadingStatistics = useSecurityStore((state) => state.setLoadingStatistics);
  const setLoadingAttempts = useSecurityStore((state) => state.setLoadingAttempts);
  const setLoadingBlockedIps = useSecurityStore((state) => state.setLoadingBlockedIps);
  const setLoadingLogs = useSecurityStore((state) => state.setLoadingLogs);
  const setError = useSecurityStore((state) => state.setError);
  const resetStore = useSecurityStore((state) => state.reset);

  /**
   * 加载安全统计信息
   */
  const loadStatistics = useCallback(async (): Promise<SecurityResult> => {
    if (!token) {
      return { ok: false, message: "未登录" };
    }
    setLoadingStatistics(true);
    setError(null);
    try {
      const response = await getSecurityStatistics(token);
      if (response.success && response.data) {
        setStatistics(response.data);
        return { ok: true };
      }
      return { ok: false, message: response.message || "获取统计信息失败" };
    } catch (err) {
      const message = err instanceof Error ? err.message : "获取统计信息失败";
      setError(message);
      return { ok: false, message };
    } finally {
      setLoadingStatistics(false);
    }
  }, [token, setStatistics, setLoadingStatistics, setError]);

  /**
   * 加载登录尝试记录
   */
  const loadLoginAttempts = useCallback(
    async (params?: { ipAddress?: string; limit?: number }): Promise<SecurityResult> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      setLoadingAttempts(true);
      setError(null);
      try {
        const response = await getLoginAttempts(token, params);
        if (response.success && response.data) {
          setLoginAttempts(response.data);
          return { ok: true };
        }
        return { ok: false, message: response.message || "获取登录尝试记录失败" };
      } catch (err) {
        const message = err instanceof Error ? err.message : "获取登录尝试记录失败";
        setError(message);
        return { ok: false, message };
      } finally {
        setLoadingAttempts(false);
      }
    },
    [token, setLoginAttempts, setLoadingAttempts, setError]
  );

  /**
   * 加载封禁IP列表
   */
  const loadBlockedIps = useCallback(
    async (limit?: number): Promise<SecurityResult> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      setLoadingBlockedIps(true);
      setError(null);
      try {
        const response = await getBlockedIps(token, limit);
        if (response.success && response.data) {
          setBlockedIps(response.data);
          return { ok: true };
        }
        return { ok: false, message: response.message || "获取封禁IP列表失败" };
      } catch (err) {
        const message = err instanceof Error ? err.message : "获取封禁IP列表失败";
        setError(message);
        return { ok: false, message };
      } finally {
        setLoadingBlockedIps(false);
      }
    },
    [token, setBlockedIps, setLoadingBlockedIps, setError]
  );

  /**
   * 封禁IP
   */
  const handleBlockIp = useCallback(
    async (data: {
      ipAddress: string;
      reason: string;
      durationMinutes?: number;
    }): Promise<SecurityResult> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      try {
        const response = await blockIp(token, data);
        if (response.success) {
          // 重新加载列表
          await loadBlockedIps();
          return { ok: true };
        }
        return { ok: false, message: response.message || "封禁IP失败" };
      } catch (err) {
        const message = err instanceof Error ? err.message : "封禁IP失败";
        return { ok: false, message };
      }
    },
    [token, loadBlockedIps]
  );

  /**
   * 解封IP
   */
  const handleUnblockIp = useCallback(
    async (ipAddress: string): Promise<SecurityResult> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      try {
        const response = await unblockIp(token, ipAddress);
        if (response.success) {
          removeBlockedIp(ipAddress);
          return { ok: true };
        }
        return { ok: false, message: response.message || "解封IP失败" };
      } catch (err) {
        const message = err instanceof Error ? err.message : "解封IP失败";
        return { ok: false, message };
      }
    },
    [token, removeBlockedIp]
  );

  /**
   * 检查IP状态
   */
  const handleCheckIpStatus = useCallback(
    async (
      ipAddress: string
    ): Promise<SecurityResult & { data?: { ipAddress: string; blocked: boolean; reason?: string } }> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      try {
        const response = await checkIpStatus(token, ipAddress);
        if (response.success) {
          return { ok: true, data: response.data };
        }
        return { ok: false, message: response.message || "检查IP状态失败" };
      } catch (err) {
        const message = err instanceof Error ? err.message : "检查IP状态失败";
        return { ok: false, message };
      }
    },
    [token]
  );

  /**
   * 加载安全事件日志
   */
  const loadSecurityLogs = useCallback(
    async (params?: {
      type?: string;
      severity?: string;
      resolved?: boolean;
      limit?: number;
      offset?: number;
    }): Promise<SecurityResult> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      setLoadingLogs(true);
      setError(null);
      try {
        const response = await getSecurityLogs(token, params);
        if (response.success && response.data) {
          setSecurityLogs(response.data);
          return { ok: true };
        }
        return { ok: false, message: response.message || "获取安全日志失败" };
      } catch (err) {
        const message = err instanceof Error ? err.message : "获取安全日志失败";
        setError(message);
        return { ok: false, message };
      } finally {
        setLoadingLogs(false);
      }
    },
    [token, setSecurityLogs, setLoadingLogs, setError]
  );

  /**
   * 解决安全事件
   */
  const handleResolveEvent = useCallback(
    async (logId: string): Promise<SecurityResult> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      try {
        const response = await resolveSecurityEvent(token, logId);
        if (response.success) {
          updateSecurityLog(logId, { resolved: true, resolvedAt: new Date().toISOString() });
          return { ok: true };
        }
        return { ok: false, message: response.message || "解决事件失败" };
      } catch (err) {
        const message = err instanceof Error ? err.message : "解决事件失败";
        return { ok: false, message };
      }
    },
    [token, updateSecurityLog]
  );

  /**
   * 重置
   */
  const reset = useCallback(() => {
    resetStore();
  }, [resetStore]);

  return {
    // 状态
    statistics,
    loginAttempts,
    blockedIps,
    securityLogs,
    loadingStatistics,
    loadingAttempts,
    loadingBlockedIps,
    loadingLogs,
    error,
    // 方法
    loadStatistics,
    loadLoginAttempts,
    loadBlockedIps,
    handleBlockIp,
    handleUnblockIp,
    handleCheckIpStatus,
    loadSecurityLogs,
    handleResolveEvent,
    reset,
  };
}
