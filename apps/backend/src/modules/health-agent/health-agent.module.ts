/**
 * AI 健康分析模块
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthAgentService } from './health-agent.service';
import { HealthAgentController } from './health-agent.controller';
import { HealthConversationService } from './health-conversation.service';
import { HealthConversationController } from './health-conversation.controller';
import { HealthRecordsService } from './health-records.service';
import { HealthRecordsController } from './health-records.controller';
import { DbModule } from '@/db/db.module';
import { AuthModule } from '@/auth/auth.module';
import { SecurityModule } from '@/security/security.module';
import { ProfileModule } from '@/profile/profile.module';

@Module({
  imports: [ConfigModule, DbModule, AuthModule, SecurityModule, ProfileModule], // ConfigModule 用于读取环境变量，DbModule 用于数据库操作，AuthModule 用于认证
  controllers: [HealthAgentController, HealthConversationController, HealthRecordsController],
  providers: [HealthAgentService, HealthConversationService, HealthRecordsService],
  exports: [HealthAgentService, HealthConversationService, HealthRecordsService], // 导出服务供其他模块使用
})
export class HealthAgentModule { }
