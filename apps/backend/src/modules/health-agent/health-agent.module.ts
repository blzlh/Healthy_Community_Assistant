/**
 * AI 健康分析模块
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthAgentService } from './health-agent.service';
import { HealthAgentController } from './health-agent.controller';

@Module({
  imports: [ConfigModule], // 用于读取环境变量
  controllers: [HealthAgentController],
  providers: [HealthAgentService],
  exports: [HealthAgentService], // 导出服务供其他模块使用
})
export class HealthAgentModule { }
