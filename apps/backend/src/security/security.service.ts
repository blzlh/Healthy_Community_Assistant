/**
 * 安全防护服务 - 暴力破解检测、IP封禁管理
 */

import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { DbService } from '@/db/db.service';
import { loginAttempts, ipBans, securityLogs } from '@/db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';

// Redis 键前缀
const REDIS_PREFIX = {
  LOGIN_ATTEMPTS: 'security:login_attempts:',
  IP_BLOCKED: 'security:ip_blocked:',
};

// 暴力破解检测配置
const BRUTE_FORCE_CONFIG = {
  MAX_ATTEMPTS: 5, // 最大尝试次数
  WINDOW_SECONDS: 60, // 时间窗口（秒）
  BLOCK_DURATION_SECONDS: 600, // 封禁时长（秒）= 10分钟
};

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);
  private redis: Redis;

  constructor(
    private readonly configService: ConfigService,
    private readonly dbService: DbService,
  ) {
    // 初始化 Redis 连接
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
    });

    this.redis.on('connect', () => {
      this.logger.log('Redis connected for security service');
    });

    this.redis.on('error', (err) => {
      this.logger.error('Redis connection error:', err);
    });
  }

  /**
   * 记录登录尝试
   * @param ipAddress IP 地址
   * @param email 邮箱
   * @param success 是否成功
   * @param failureReason 失败原因
   * @param userAgent 用户代理
   */
  async recordLoginAttempt(
    ipAddress: string,
    email: string | undefined,
    success: boolean,
    failureReason?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      // 1. 记录到数据库
      await this.dbService.db.insert(loginAttempts).values({
        ipAddress,
        email: email || null,
        success,
        failureReason: failureReason || null,
        userAgent: userAgent || null,
      });

      // 2. 更新 Redis 计数器
      const key = `${REDIS_PREFIX.LOGIN_ATTEMPTS}${ipAddress}`;
      
      if (success) {
        // 登录成功，清除失败计数
        await this.redis.del(key);
        this.logger.log(`Login success from IP: ${ipAddress}, cleared failed attempts`);
      } else {
        // 登录失败，增加计数
        const currentCount = await this.redis.incr(key);
        
        // 设置过期时间（首次设置）
        if (currentCount === 1) {
          await this.redis.expire(key, BRUTE_FORCE_CONFIG.WINDOW_SECONDS);
        }

        this.logger.warn(
          `Login failed from IP: ${ipAddress}, attempt ${currentCount}/${BRUTE_FORCE_CONFIG.MAX_ATTEMPTS}`,
        );

        // 检测暴力破解
        if (currentCount >= BRUTE_FORCE_CONFIG.MAX_ATTEMPTS) {
          await this.handleBruteForceDetected(ipAddress, email);
        }
      }
    } catch (error) {
      this.logger.error('Failed to record login attempt:', error);
    }
  }

  /**
   * 处理暴力破解检测
   */
  private async handleBruteForceDetected(
    ipAddress: string,
    email: string | undefined,
  ): Promise<void> {
    this.logger.warn(`Brute force attack detected from IP: ${ipAddress}`);

    // 1. 自动封禁 IP
    await this.blockIp(ipAddress, `检测到暴力破解攻击：60秒内登录失败${BRUTE_FORCE_CONFIG.MAX_ATTEMPTS}次`, true);

    // 2. 记录安全事件日志
    await this.logSecurityEvent({
      type: 'brute_force',
      severity: 'high',
      ipAddress,
      details: {
        email,
        attempts: BRUTE_FORCE_CONFIG.MAX_ATTEMPTS,
        windowSeconds: BRUTE_FORCE_CONFIG.WINDOW_SECONDS,
        blockedDuration: BRUTE_FORCE_CONFIG.BLOCK_DURATION_SECONDS,
      },
      actionTaken: 'blocked',
    });
  }

  /**
   * 封禁 IP
   */
  async blockIp(
    ipAddress: string,
    reason: string,
    autoBlocked: boolean = false,
    bannedBy?: string,
    durationSeconds?: number,
  ): Promise<void> {
    try {
      // 1. 计算过期时间
      const expiresAt = durationSeconds
        ? new Date(Date.now() + durationSeconds * 1000)
        : new Date(Date.now() + BRUTE_FORCE_CONFIG.BLOCK_DURATION_SECONDS * 1000);

      // 2. 写入数据库
      await this.dbService.db.insert(ipBans).values({
        ipAddress,
        reason,
        bannedBy: bannedBy || null,
        autoBlocked,
        expiresAt,
      });

      // 3. 写入 Redis 缓存（用于快速检查）
      const key = `${REDIS_PREFIX.IP_BLOCKED}${ipAddress}`;
      await this.redis.setex(
        key,
        durationSeconds || BRUTE_FORCE_CONFIG.BLOCK_DURATION_SECONDS,
        JSON.stringify({ reason, autoBlocked, expiresAt: expiresAt.toISOString() }),
      );

      this.logger.log(
        `IP blocked: ${ipAddress}, reason: ${reason}, expires: ${expiresAt.toISOString()}`,
      );
    } catch (error) {
      this.logger.error('Failed to block IP:', error);
      throw error;
    }
  }

  /**
   * 解封 IP
   */
  async unblockIp(ipAddress: string): Promise<boolean> {
    try {
      // 1. 从 Redis 删除
      const key = `${REDIS_PREFIX.IP_BLOCKED}${ipAddress}`;
      await this.redis.del(key);

      // 2. 标记数据库中的记录为过期
      const result = await this.dbService.db
        .update(ipBans)
        .set({ expiresAt: new Date() })
        .where(and(eq(ipBans.ipAddress, ipAddress), gte(ipBans.expiresAt, new Date())))
        .returning({ id: ipBans.id });

      if (result.length > 0) {
        this.logger.log(`IP unblocked: ${ipAddress}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Failed to unblock IP:', error);
      return false;
    }
  }

  /**
   * 检查 IP 是否被封禁
   */
  async isIpBlocked(ipAddress: string): Promise<{ blocked: boolean; reason?: string }> {
    try {
      // 优先从 Redis 检查（快速）
      const key = `${REDIS_PREFIX.IP_BLOCKED}${ipAddress}`;
      const cached = await this.redis.get(key);

      if (cached) {
        const data = JSON.parse(cached);
        return { blocked: true, reason: data.reason };
      }

      // Redis 未命中，检查数据库（兜底）
      const activeBans = await this.dbService.db
        .select()
        .from(ipBans)
        .where(
          and(eq(ipBans.ipAddress, ipAddress), gte(ipBans.expiresAt, new Date())),
        )
        .limit(1);

      if (activeBans.length > 0) {
        const ban = activeBans[0];
        // 回写 Redis 缓存
        const ttl = Math.floor((ban.expiresAt!.getTime() - Date.now()) / 1000);
        if (ttl > 0) {
          await this.redis.setex(
            key,
            ttl,
            JSON.stringify({ reason: ban.reason, autoBlocked: ban.autoBlocked }),
          );
        }
        return { blocked: true, reason: ban.reason };
      }

      return { blocked: false };
    } catch (error) {
      this.logger.error('Failed to check IP blocked status:', error);
      // 出错时不阻止访问，避免影响正常用户
      return { blocked: false };
    }
  }

  /**
   * 记录安全事件日志
   */
  async logSecurityEvent(params: {
    type: string;
    severity: string;
    ipAddress?: string;
    userId?: string;
    endpoint?: string;
    details?: Record<string, any>;
    actionTaken?: string;
  }): Promise<void> {
    try {
      await this.dbService.db.insert(securityLogs).values({
        type: params.type,
        severity: params.severity,
        ipAddress: params.ipAddress || null,
        userId: params.userId || null,
        endpoint: params.endpoint || null,
        details: params.details || null,
        actionTaken: params.actionTaken || null,
      });

      this.logger.log(
        `Security event logged: ${params.type} [${params.severity}] from ${params.ipAddress}`,
      );
    } catch (error) {
      this.logger.error('Failed to log security event:', error);
    }
  }

  /**
   * 获取登录尝试历史
   */
  async getLoginAttempts(ipAddress?: string, limit: number = 100) {
    try {
      const query = this.dbService.db
        .select()
        .from(loginAttempts)
        .orderBy(desc(loginAttempts.createdAt))
        .limit(limit);

      if (ipAddress) {
        return await query.where(eq(loginAttempts.ipAddress, ipAddress));
      }

      return await query;
    } catch (error) {
      this.logger.error('Failed to get login attempts:', error);
      return [];
    }
  }

  /**
   * 获取封禁 IP 列表
   */
  async getBlockedIps(limit: number = 100) {
    try {
      return await this.dbService.db
        .select()
        .from(ipBans)
        .where(gte(ipBans.expiresAt, new Date()))
        .orderBy(desc(ipBans.createdAt))
        .limit(limit);
    } catch (error) {
      this.logger.error('Failed to get blocked IPs:', error);
      return [];
    }
  }

  /**
   * 获取安全事件日志
   */
  async getSecurityLogs(params: {
    type?: string;
    severity?: string;
    resolved?: boolean;
    limit?: number;
    offset?: number;
  }) {
    try {
      const { type, severity, resolved, limit = 100, offset = 0 } = params;

      let query = this.dbService.db
        .select()
        .from(securityLogs)
        .orderBy(desc(securityLogs.createdAt))
        .limit(limit)
        .offset(offset)
        .$dynamic();

      // 添加过滤条件
      const conditions = [];
      if (type) {
        conditions.push(eq(securityLogs.type, type));
      }
      if (severity) {
        conditions.push(eq(securityLogs.severity, severity));
      }
      if (resolved !== undefined) {
        conditions.push(eq(securityLogs.resolved, resolved));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      return await query;
    } catch (error) {
      this.logger.error('Failed to get security logs:', error);
      return [];
    }
  }

  /**
   * 解决安全事件
   */
  async resolveSecurityEvent(logId: string, resolvedBy: string): Promise<boolean> {
    try {
      const result = await this.dbService.db
        .update(securityLogs)
        .set({
          resolved: true,
          resolvedAt: new Date(),
          resolvedBy,
        })
        .where(eq(securityLogs.id, logId))
        .returning({ id: securityLogs.id });

      return result.length > 0;
    } catch (error) {
      this.logger.error('Failed to resolve security event:', error);
      return false;
    }
  }

  /**
   * 获取统计数据
   */
  async getStatistics() {
    try {
      // 今日开始时间
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 统计今日登录失败次数
      const todayFailedAttempts = await this.dbService.db
        .select()
        .from(loginAttempts)
        .where(
          and(
            eq(loginAttempts.success, false),
            gte(loginAttempts.createdAt, today),
          ),
        );

      // 统计当前封禁的 IP 数量
      const activeBans = await this.dbService.db
        .select()
        .from(ipBans)
        .where(gte(ipBans.expiresAt, new Date()));

      // 统计今日安全事件
      const todayEvents = await this.dbService.db
        .select()
        .from(securityLogs)
        .where(gte(securityLogs.createdAt, today));

      // 按类型统计
      const eventsByType = todayEvents.reduce(
        (acc, event) => {
          acc[event.type] = (acc[event.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        todayFailedAttempts: todayFailedAttempts.length,
        activeBlockedIps: activeBans.length,
        todaySecurityEvents: todayEvents.length,
        eventsByType,
        bruteForceDetections: eventsByType['brute_force'] || 0,
      };
    } catch (error) {
      this.logger.error('Failed to get statistics:', error);
      return {
        todayFailedAttempts: 0,
        activeBlockedIps: 0,
        todaySecurityEvents: 0,
        eventsByType: {},
        bruteForceDetections: 0,
      };
    }
  }
}
