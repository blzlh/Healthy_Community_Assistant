/**
 * 安全防护模块
 */

import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { RateLimiterInterceptor } from './rate-limiter.interceptor';
import { ElkLoggerService } from './elk-logger.service';
import { ProfileModule } from '@/profile/profile.module';
import { DbModule } from '@/db/db.module';

@Module({
  imports: [ConfigModule, DbModule, forwardRef(() => ProfileModule)],
  controllers: [SecurityController],
  providers: [SecurityService, RateLimiterInterceptor, ElkLoggerService],
  exports: [SecurityService, RateLimiterInterceptor, ElkLoggerService],
})
export class SecurityModule {}
