/**
 * 登录日志拦截器 - 拦截登录请求，记录日志并检测暴力破解
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

@Injectable()
export class LoginLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoginLoggingInterceptor.name);

  constructor(private readonly securityService: SecurityService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // 获取客户端 IP
    const ipAddress =
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown';

    // 获取请求体
    const body = request.body;
    const email = body?.email;
    const userAgent = request.headers['user-agent'];
    const endpoint = request.route?.path || request.path;

    // 如果是登录或注册请求
    if (endpoint?.includes('/auth/login') || endpoint?.includes('/auth/register')) {
      // 检查 IP 是否被封禁
      const { blocked, reason } = await this.securityService.isIpBlocked(ipAddress);

      if (blocked) {
        this.logger.warn(`Blocked request from banned IP: ${ipAddress}, reason: ${reason}`);
        throw new HttpException(
          { message: '您的IP已被封禁，请稍后再试或联系管理员。' },
          HttpStatus.FORBIDDEN,
        );
      }

      const startTime = Date.now();

      return next.handle().pipe(
        tap({
          next: async (data) => {
            // 登录/注册成功
            if (endpoint?.includes('/auth/login')) {
              await this.securityService.recordLoginAttempt(
                ipAddress,
                email,
                true,
                undefined,
                userAgent,
              );
            }
            this.logger.log(
              `${endpoint} success - IP: ${ipAddress}, Email: ${email}, Duration: ${Date.now() - startTime}ms`,
            );
          },
        }),
        catchError(async (error) => {
          // 登录/注册失败
          const errorMessage = error?.response?.message || error?.message || 'Unknown error';
          
          await this.securityService.recordLoginAttempt(
            ipAddress,
            email,
            false,
            errorMessage,
            userAgent,
          );

          this.logger.warn(
            `${endpoint} failed - IP: ${ipAddress}, Email: ${email}, Error: ${errorMessage}`,
          );

          return throwError(() => error);
        }),
      );
    }

    return next.handle();
  }
}
