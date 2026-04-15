/**
 * Elasticsearch 日志服务 - 将安全日志推送到 ELK Stack
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as net from 'net';

interface LogEntry {
  type: string;
  severity?: string;
  ipAddress?: string;
  userId?: string;
  userName?: string;
  endpoint?: string;
  method?: string;
  details?: Record<string, any>;
  actionTaken?: string;
  reason?: string;
  createdAt: string;
}

@Injectable()
export class ElkLoggerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ElkLoggerService.name);
  private socket: net.Socket | null = null;
  private isConnected = false;
  private logBuffer: LogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  private readonly logstashHost: string;
  private readonly logstashPort: number;
  private readonly enabled: boolean;
  private readonly flushSize: number = 10; // 缓冲区大小
  private readonly flushDelay: number = 5000; // 刷新间隔 ms

  constructor(private readonly configService: ConfigService) {
    this.logstashHost = this.configService.get('LOGSTASH_HOST', 'localhost');
    this.logstashPort = parseInt(this.configService.get('LOGSTASH_PORT', '5044'), 10);
    this.enabled = this.configService.get('ELK_ENABLED', 'false') === 'true';
  }

  async onModuleInit() {
    if (!this.enabled) {
      this.logger.log('ELK logging is disabled');
      return;
    }

    await this.connect();

    // 定时刷新缓冲区
    this.flushInterval = setInterval(() => {
      this.flushBuffer();
    }, this.flushDelay);
  }

  async onModuleDestroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flushBuffer();
    this.disconnect();
  }

  private async connect(): Promise<void> {
    return new Promise((resolve) => {
      this.socket = new net.Socket();

      this.socket.connect(this.logstashPort, this.logstashHost, () => {
        this.isConnected = true;
        this.logger.log(`Connected to Logstash at ${this.logstashHost}:${this.logstashPort}`);
        resolve();
      });

      this.socket.on('error', (err) => {
        this.logger.error(`Logstash connection error: ${err.message}`);
        this.isConnected = false;
        resolve();
      });

      this.socket.on('close', () => {
        this.logger.warn('Logstash connection closed');
        this.isConnected = false;
      });
    });
  }

  private disconnect(): void {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * 记录安全事件日志
   */
  logSecurityEvent(entry: LogEntry): void {
    if (!this.enabled) return;

    this.logBuffer.push(entry);

    // 缓冲区满时立即刷新
    if (this.logBuffer.length >= this.flushSize) {
      this.flushBuffer();
    }
  }

  /**
   * 记录暴力破解事件
   */
  logBruteForce(params: {
    ipAddress: string;
    email?: string;
    attempts: number;
    windowSeconds: number;
    blockedDuration: number;
    actionTaken: string;
  }): void {
    this.logSecurityEvent({
      type: 'brute_force',
      severity: 'high',
      ipAddress: params.ipAddress,
      details: {
        email: params.email,
        attempts: params.attempts,
        windowSeconds: params.windowSeconds,
        blockedDuration: params.blockedDuration,
      },
      actionTaken: params.actionTaken,
      reason: `${params.windowSeconds} 秒内登录失败 ${params.attempts} 次，封禁 ${params.blockedDuration} 秒`,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * 记录接口滥用事件
   */
  logApiAbuse(params: {
    endpoint: string;
    method: string;
    ipAddress: string;
    userId?: string;
    userName?: string;
    qps: number;
    duration: number;
    rateLimitDuration: number;
    actionTaken: string;
  }): void {
    this.logSecurityEvent({
      type: 'api_abuse',
      severity: 'high',
      ipAddress: params.ipAddress,
      userId: params.userId,
      userName: params.userName,
      endpoint: params.endpoint,
      method: params.method,
      details: {
        qps: params.qps,
        duration: params.duration,
        rateLimitDuration: params.rateLimitDuration,
      },
      actionTaken: params.actionTaken,
      reason: `QPS=${params.qps} 持续 ${params.duration} 秒，限流 ${params.rateLimitDuration} 秒`,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * 记录 WebSocket 刷屏事件
   */
  logWebSocketSpam(params: {
    socketId: string;
    ipAddress?: string;
    userId?: string;
    userName?: string;
    messageCount: number;
    windowSeconds: number;
    cooldownSeconds: number;
    actionTaken: string;
  }): void {
    this.logSecurityEvent({
      type: 'spam',
      severity: 'medium',
      ipAddress: params.ipAddress,
      userId: params.userId,
      userName: params.userName,
      details: {
        socketId: params.socketId,
        messageCount: params.messageCount,
        windowSeconds: params.windowSeconds,
        cooldownSeconds: params.cooldownSeconds,
      },
      actionTaken: params.actionTaken,
      reason: `${params.windowSeconds} 秒内发送 ${params.messageCount} 条消息，冷却 ${params.cooldownSeconds} 秒`,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * 刷新缓冲区，发送日志到 Logstash
   */
  private flushBuffer(): void {
    if (!this.enabled || this.logBuffer.length === 0) return;

    if (!this.isConnected) {
      this.logger.warn('Logstash not connected, buffering logs...');
      return;
    }

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      for (const log of logsToSend) {
        const jsonLine = JSON.stringify(log) + '\n';
        this.socket?.write(jsonLine);
      }
      this.logger.debug(`Flushed ${logsToSend.length} logs to Logstash`);
    } catch (err) {
      this.logger.error(`Failed to send logs to Logstash: ${err}`);
      // 发送失败时放回缓冲区
      this.logBuffer = [...logsToSend, ...this.logBuffer];
    }
  }
}
