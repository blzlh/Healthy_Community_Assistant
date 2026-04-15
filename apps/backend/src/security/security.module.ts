/**
 * 安全防护模块
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { ProfileModule } from '@/profile/profile.module';
import { DbModule } from '@/db/db.module';

@Module({
  imports: [ConfigModule, DbModule, ProfileModule],
  controllers: [SecurityController],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
