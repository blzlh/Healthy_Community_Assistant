/**
 * 安全监控 Store
 */

"use client";

import { create } from "zustand";

// 登录尝试记录类型
export type LoginAttempt = {
  id: string;
  ipAddress: string;
  email: string | null;
  success: boolean;
  failureReason: string | null;
  userAgent: string | null;
  createdAt: string;
};

// IP封禁记录类型
export type IpBan = {
  id: string;
  ipAddress: string;
  reason: string;
  bannedBy: string | null;
  autoBlocked: boolean;
  expiresAt: string;
  createdAt: string;
};

// 安全事件日志类型
export type SecurityLog = {
  id: string;
  type: string;
  severity: string;
  ipAddress: string | null;
  userId: string | null;
  endpoint: string | null;
  details: Record<string, any> | null;
  actionTaken: string | null;
  resolved: boolean;
  resolvedAt: string | null;
  resolvedBy: string | null;
  createdAt: string;
};

// 安全统计数据类型
export type SecurityStatistics = {
  todayFailedAttempts: number;
  activeBlockedIps: number;
  todaySecurityEvents: number;
  eventsByType: Record<string, number>;
  bruteForceDetections: number;
};

type SecurityState = {
  // 统计数据
  statistics: SecurityStatistics | null;
  // 登录尝试记录
  loginAttempts: LoginAttempt[];
  // 封禁IP列表
  blockedIps: IpBan[];
  // 安全事件日志
  securityLogs: SecurityLog[];
  // 加载状态
  loadingStatistics: boolean;
  loadingAttempts: boolean;
  loadingBlockedIps: boolean;
  loadingLogs: boolean;
  // 错误信息
  error: string | null;

  // 操作方法
  setStatistics: (statistics: SecurityStatistics) => void;
  setLoginAttempts: (attempts: LoginAttempt[]) => void;
  setBlockedIps: (ips: IpBan[]) => void;
  addBlockedIp: (ip: IpBan) => void;
  removeBlockedIp: (ipAddress: string) => void;
  setSecurityLogs: (logs: SecurityLog[]) => void;
  updateSecurityLog: (id: string, updates: Partial<SecurityLog>) => void;
  setLoadingStatistics: (loading: boolean) => void;
  setLoadingAttempts: (loading: boolean) => void;
  setLoadingBlockedIps: (loading: boolean) => void;
  setLoadingLogs: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

export const useSecurityStore = create<SecurityState>((set) => ({
  // 初始状态
  statistics: null,
  loginAttempts: [],
  blockedIps: [],
  securityLogs: [],
  loadingStatistics: false,
  loadingAttempts: false,
  loadingBlockedIps: false,
  loadingLogs: false,
  error: null,

  // 操作方法
  setStatistics: (statistics) => set({ statistics }),
  setLoginAttempts: (attempts) => set({ loginAttempts: attempts }),
  setBlockedIps: (ips) => set({ blockedIps: ips }),
  addBlockedIp: (ip) => set((state) => ({ blockedIps: [ip, ...state.blockedIps] })),
  removeBlockedIp: (ipAddress) =>
    set((state) => ({
      blockedIps: state.blockedIps.filter((ip) => ip.ipAddress !== ipAddress),
    })),
  setSecurityLogs: (logs) => set({ securityLogs: logs }),
  updateSecurityLog: (id, updates) =>
    set((state) => ({
      securityLogs: state.securityLogs.map((log) =>
        log.id === id ? { ...log, ...updates } : log
      ),
    })),
  setLoadingStatistics: (loading) => set({ loadingStatistics: loading }),
  setLoadingAttempts: (loading) => set({ loadingAttempts: loading }),
  setLoadingBlockedIps: (loading) => set({ loadingBlockedIps: loading }),
  setLoadingLogs: (loading) => set({ loadingLogs: loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      statistics: null,
      loginAttempts: [],
      blockedIps: [],
      securityLogs: [],
      loadingStatistics: false,
      loadingAttempts: false,
      loadingBlockedIps: false,
      loadingLogs: false,
      error: null,
    }),
}));
