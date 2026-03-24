/**
 * AI 健康分析控制器
 * 提供健康数据分析 API 接口
 * 支持流式输出 (SSE)
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Sse,
  Param,
  HttpException,
  HttpStatus,
  MessageEvent,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Observable, from, map } from 'rxjs';
import { HealthAgentService, StreamEvent } from './health-agent.service';
import {
  AnalyzeHealthDto,
  ContinueConversationDto,
  HealthAnalysisResponseDto,
  AgentHealthStatusDto,
} from './dto/health-agent.dto';

@ApiTags('健康分析')
@Controller('health-analysis')
export class HealthAgentController {
  constructor(private readonly healthAgentService: HealthAgentService) { }

  /**
   * 分析健康数据 - 流式输出
   * POST /health-analysis/analyze/stream
   * 返回 SSE 流
   */
  @Post('analyze/stream')
  @Sse()
  @ApiOperation({ summary: '分析健康数据(流式)', description: '提交健康数据，获取 AI 分析报告(流式输出)' })
  analyzeHealthStream(@Body() dto: AnalyzeHealthDto): Observable<MessageEvent> {
    const generator = this.healthAgentService.analyzeHealthDataStream(
      {
        bloodPressure: dto.bloodPressure,
        heartRate: dto.heartRate,
        bloodSugar: dto.bloodSugar,
        weight: dto.weight,
        height: dto.height,
        age: dto.age,
        sleepHours: dto.sleepHours,
        exerciseMinutes: dto.exerciseMinutes,
      },
      dto.sessionId
    );

    return this.streamToObservable(generator);
  }

  /**
   * 多轮对话 - 流式输出
   * POST /health-analysis/continue/stream
   */
  @Post('continue/stream')
  @Sse()
  @ApiOperation({ summary: '继续对话(流式)', description: '基于之前的分析继续提问(流式输出)' })
  continueConversationStream(@Body() dto: ContinueConversationDto): Observable<MessageEvent> {
    const generator = this.healthAgentService.continueConversationStream(
      dto.question,
      dto.sessionId
    );

    return this.streamToObservable(generator);
  }

  /**
   * 将 AsyncGenerator 转换为 Observable<MessageEvent>
   */
  private streamToObservable(generator: AsyncGenerator<StreamEvent>): Observable<MessageEvent> {
    return from(generator).pipe(
      map((event: StreamEvent) => ({
        data: event,
      } as MessageEvent))
    );
  }

  /**
   * 检查 Agent 服务状态
   * GET /health-analysis/status
   */
  @Get('status')
  @ApiOperation({ summary: '检查服务状态', description: '检查 AI 健康分析服务是否可用' })
  @ApiResponse({
    status: 200,
    description: '状态检查成功',
    type: AgentHealthStatusDto,
  })
  async checkStatus(): Promise<AgentHealthStatusDto> {
    const isHealthy = await this.healthAgentService.checkHealth();

    return {
      status: isHealthy ? 'ok' : 'error',
      message: isHealthy
        ? 'AI 健康分析服务运行正常'
        : 'AI 健康分析服务不可用',
    };
  }
}
