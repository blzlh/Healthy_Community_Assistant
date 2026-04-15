import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { SecurityModule } from '@/security/security.module';
import { LoginLoggingInterceptor } from '@/security/security.interceptor';

@Module({
  imports: [ConfigModule, SecurityModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    SupabaseAuthGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoginLoggingInterceptor,
    },
  ],
  exports: [SupabaseAuthGuard, AuthService],
})
export class AuthModule {}
