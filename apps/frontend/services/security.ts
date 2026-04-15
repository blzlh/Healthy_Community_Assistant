/**
 * 安全监控服务 - API 调用封装
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// 类型定义
export type LoginAttempt = {
  id: string;
  ipAddress: string;
  email: string | null;
  success: boolean;
  failureReason: string | null;
  userAgent: string | null;
  createdAt: string;
};

export type IpBan = {
  id: string;
  ipAddress: string;
  reason: string;
  bannedBy: string | null;
  autoBlocked: boolean;
  expiresAt: string;
  createdAt: string;
};

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

export type SecurityStatistics = {
  todayFailedAttempts: number;
  activeBlockedIps: number;
  todaySecurityEvents: number;
  eventsByType: Record<string, number>;
  bruteForceDetections: number;
  spamDetections: number;
};

export type WebsocketEvent = {
  id: string;
  eventType: string; // 'connect', 'disconnect', 'message', 'spam_detected'
  socketId: string;
  userId: string | null;
  userName: string | null;
  ipAddress: string | null;
  roomId: string | null;
  messagePreview: string | null;
  messageCount: string | null;
  reason: string | null;
  createdAt: string;
};

export type WebsocketStatistics = {
  todayConnections: number;
  todayDisconnections: number;
  todaySpamDetections: number;
  todayMessages: number;
};

/**
 * 获取安全统计信息
 */
export async function getSecurityStatistics(
  token: string,
): Promise<{ success: boolean; data?: SecurityStatistics; message?: string }> {
  const response = await fetch(`${API_BASE}/security/statistics`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '获取统计信息失败' }));
    return { success: false, message: error.message || '获取统计信息失败' };
  }

  return response.json();
}

/**
 * 获取登录尝试记录
 */
export async function getLoginAttempts(
  token: string,
  params?: { ipAddress?: string; limit?: number },
): Promise<{ success: boolean; data?: LoginAttempt[]; message?: string }> {
  const queryParams = new URLSearchParams();
  if (params?.ipAddress) queryParams.append('ipAddress', params.ipAddress);
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const url = `${API_BASE}/security/login-attempts?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '获取登录尝试记录失败' }));
    return { success: false, message: error.message || '获取登录尝试记录失败' };
  }

  return response.json();
}

/**
 * 获取封禁IP列表
 */
export async function getBlockedIps(
  token: string,
  limit?: number,
): Promise<{ success: boolean; data?: IpBan[]; message?: string }> {
  const queryParams = limit ? `?limit=${limit}` : '';
  const response = await fetch(`${API_BASE}/security/blocked-ips${queryParams}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '获取封禁IP列表失败' }));
    return { success: false, message: error.message || '获取封禁IP列表失败' };
  }

  return response.json();
}

/**
 * 封禁IP
 */
export async function blockIp(
  token: string,
  data: { ipAddress: string; reason: string; durationMinutes?: number },
): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(`${API_BASE}/security/block-ip`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '封禁IP失败' }));
    return { success: false, message: error.message || '封禁IP失败' };
  }

  return response.json();
}

/**
 * 解封IP
 */
export async function unblockIp(
  token: string,
  ipAddress: string,
): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(`${API_BASE}/security/block-ip/${encodeURIComponent(ipAddress)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '解封IP失败' }));
    return { success: false, message: error.message || '解封IP失败' };
  }

  return response.json();
}

/**
 * 检查IP封禁状态
 */
export async function checkIpStatus(
  token: string,
  ipAddress: string,
): Promise<{ success: boolean; data?: { ipAddress: string; blocked: boolean; reason?: string }; message?: string }> {
  const response = await fetch(`${API_BASE}/security/check-ip/${encodeURIComponent(ipAddress)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '检查IP状态失败' }));
    return { success: false, message: error.message || '检查IP状态失败' };
  }

  return response.json();
}

/**
 * 获取安全事件日志
 */
export async function getSecurityLogs(
  token: string,
  params?: {
    type?: string;
    severity?: string;
    resolved?: boolean;
    limit?: number;
    offset?: number;
  },
): Promise<{ success: boolean; data?: SecurityLog[]; message?: string }> {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append('type', params.type);
  if (params?.severity) queryParams.append('severity', params.severity);
  if (params?.resolved !== undefined) queryParams.append('resolved', params.resolved.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  const url = `${API_BASE}/security/logs?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '获取安全日志失败' }));
    return { success: false, message: error.message || '获取安全日志失败' };
  }

  return response.json();
}

/**
 * 解决安全事件
 */
export async function resolveSecurityEvent(
  token: string,
  logId: string,
): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(`${API_BASE}/security/logs/${logId}/resolve`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '解决事件失败' }));
    return { success: false, message: error.message || '解决事件失败' };
  }

  return response.json();
}

// ==================== WebSocket 事件日志相关接口 ====================

/**
 * 获取 WebSocket 事件日志
 */
export async function getWebsocketEvents(
  token: string,
  params?: {
    eventType?: string;
    socketId?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  },
): Promise<{ success: boolean; data?: WebsocketEvent[]; message?: string }> {
  const queryParams = new URLSearchParams();
  if (params?.eventType) queryParams.append('eventType', params.eventType);
  if (params?.socketId) queryParams.append('socketId', params.socketId);
  if (params?.userId) queryParams.append('userId', params.userId);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  const url = `${API_BASE}/security/websocket-events?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '获取WebSocket事件日志失败' }));
    return { success: false, message: error.message || '获取WebSocket事件日志失败' };
  }

  return response.json();
}

/**
 * 获取 WebSocket 统计信息
 */
export async function getWebsocketStatistics(
  token: string,
): Promise<{ success: boolean; data?: WebsocketStatistics; message?: string }> {
  const response = await fetch(`${API_BASE}/security/websocket-statistics`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '获取WebSocket统计信息失败' }));
    return { success: false, message: error.message || '获取WebSocket统计信息失败' };
  }

  return response.json();
}

// ==================== 接口滥用检测相关类型和接口 ====================

export type ApiAbuseEvent = {
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
};

export type ApiAbuseStatistics = {
  todayAbuseDetections: number;
  currentRateLimited: number;
  byEndpoint: Record<string, number>;
  topEndpoints: { endpoint: string; count: number }[];
};

/**
 * 获取接口滥用事件日志
 */
export async function getApiAbuseEvents(
  token: string,
  params?: {
    endpoint?: string;
    ipAddress?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  },
): Promise<{ success: boolean; data?: ApiAbuseEvent[]; message?: string }> {
  const queryParams = new URLSearchParams();
  if (params?.endpoint) queryParams.append('endpoint', params.endpoint);
  if (params?.ipAddress) queryParams.append('ipAddress', params.ipAddress);
  if (params?.userId) queryParams.append('userId', params.userId);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  const url = `${API_BASE}/security/api-abuse-events?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '获取接口滥用事件日志失败' }));
    return { success: false, message: error.message || '获取接口滥用事件日志失败' };
  }

  return response.json();
}

/**
 * 获取接口滥用统计信息
 */
export async function getApiAbuseStatistics(
  token: string,
): Promise<{ success: boolean; data?: ApiAbuseStatistics; message?: string }> {
  const response = await fetch(`${API_BASE}/security/api-abuse-statistics`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '获取接口滥用统计信息失败' }));
    return { success: false, message: error.message || '获取接口滥用统计信息失败' };
  }

  return response.json();
}
