/**
 * 接口限流拦截器 - 检测接口滥用
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { SecurityService } from './security.service';
import { ProfileService } from '@/profile/profile.service';

// 需要监控的接口路径前缀
const MONITORED_PATHS = [
  '/api/health-records',
  '/api/community',
  '/api/health-conversations',
  '/api/profile',
];

// 排除的路径（登录、注册等）
const EXCLUDED_PATHS = ['/api/auth/login', '/api/auth/register'];

@Injectable()
export class RateLimiterInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RateLimiterInterceptor.name);

  constructor(
    private readonly securityService: SecurityService,
    private readonly profileService: ProfileService,
  ) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const endpoint = request.route?.path || request.path;
    const method = request.method;
    const ipAddress = this.extractIpAddress(request);
    const userId = request.user?.id;

    // 检查是否需要监控
    const shouldMonitor =
      MONITORED_PATHS.some((path) => endpoint.startsWith(path)) &&
      !EXCLUDED_PATHS.some((path) => endpoint.startsWith(path));

    if (!shouldMonitor) {
      return next.handle();
    }

    // 检查接口限流
    const rateCheck = await this.securityService.checkApiRateLimit(
      endpoint,
      method,
      ipAddress,
      userId,
    );

    if (rateCheck.isAbused) {
      if (rateCheck.rateLimitRemaining && rateCheck.rateLimitRemaining > 0) {
        // 已被限流
        throw new HttpException(
          {
            success: false,
            message: `请求过于频繁，请等待 ${rateCheck.rateLimitRemaining} 秒后再试`,
            code: 'RATE_LIMITED',
            retryAfter: rateCheck.rateLimitRemaining,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // 首次检测到滥用
      let userName: string | undefined;
      if (userId) {
        try {
          const profile = await this.profileService.getProfile(userId);
          userName = profile?.name || undefined;
        } catch (e) {
          // ignore
        }
      }

      await this.securityService.handleApiAbuseDetected({
        endpoint,
        method,
        ipAddress,
        userId,
        userName,
        qps: rateCheck.currentQps,
        duration: 30, // 窗口时长
      });

      throw new HttpException(
        {
          success: false,
          message: '检测到异常请求频率，已触发限流',
          code: 'API_ABUSE_DETECTED',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 正常处理请求
    return next.handle().pipe(
      catchError((error) => throwError(() => error)),
    );
  }

  private extractIpAddress(request: any): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }

    const realIp = request.headers['x-real-ip'];
    if (typeof realIp === 'string') {
      return realIp;
    }

    return request.ip || request.connection?.remoteAddress || 'unknown';
  }
}
