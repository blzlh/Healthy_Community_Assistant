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
import { HealthConversationService } from './health-conversation.service';
import {
  AnalyzeHealthDto,
  ContinueConversationDto,
  HealthAnalysisResponseDto,
  AgentHealthStatusDto,
} from './dto/health-agent.dto';

@ApiTags('健康分析')
@Controller('health-analysis')
export class HealthAgentController {
  constructor(
    private readonly healthAgentService: HealthAgentService,
    private readonly conversationService: HealthConversationService,
  ) { }

  /**
   * 分析健康数据 - 流式输出
   * POST /health-analysis/analyze/stream
   * 返回 SSE 流
   */
  @Post('analyze/stream')
  @Sse()
  @ApiOperation({ summary: '分析健康数据(流式)', description: '提交健康数据，获取 AI 分析报告(流式输出)' })
  async analyzeHealthStream(@Body() dto: AnalyzeHealthDto): Promise<Observable<MessageEvent>> {
    const healthData = {
      bloodPressure: dto.bloodPressure,
      heartRate: dto.heartRate,
      bloodSugar: dto.bloodSugar,
      weight: dto.weight,
      height: dto.height,
      age: dto.age,
      sleepHours: dto.sleepHours,
      exerciseMinutes: dto.exerciseMinutes,
    };

    // 格式化用户消息
    const userMessage = this.formatHealthDataMessage(healthData);

    // 保存用户消息到数据库
    if (dto.conversationId) {
      try {
        await this.conversationService.addMessage(
          dto.conversationId,
          'user',
          userMessage,
          {
            bloodPressure: dto.bloodPressure,
            heartRate: dto.heartRate,
            bloodSugar: dto.bloodSugar,
            weight: dto.weight,
            height: dto.height,
            age: dto.age?.toString(),
          },
        );
      } catch (err) {
        console.error('保存用户消息失败:', err);
      }
    }

    const generator = this.healthAgentService.analyzeHealthDataStream(
      healthData,
      dto.sessionId
    );

    // 收集完整响应
    let fullContent = '';
    let sessionId = '';

    // 创建一个新的 generator 来收集内容并在结束时保存
    const wrappedGenerator = this.wrapGeneratorWithSave(
      generator,
      dto.conversationId,
      (content, sid) => {
        fullContent = content;
        sessionId = sid;
      }
    );

    return this.streamToObservable(wrappedGenerator);
  }

  /**
   * 多轮对话 - 流式输出
   * POST /health-analysis/continue/stream
   */
  @Post('continue/stream')
  @Sse()
  @ApiOperation({ summary: '继续对话(流式)', description: '基于之前的分析继续提问(流式输出)' })
  async continueConversationStream(@Body() dto: ContinueConversationDto): Promise<Observable<MessageEvent>> {
    // 保存用户消息到数据库
    if (dto.conversationId) {
      try {
        await this.conversationService.addMessage(
          dto.conversationId,
          'user',
          dto.question,
        );
      } catch (err) {
        console.error('保存用户消息失败:', err);
      }
    }

    const generator = this.healthAgentService.continueConversationStream(
      dto.question,
      dto.sessionId
    );

    // 创建一个新的 generator 来收集内容并在结束时保存
    const wrappedGenerator = this.wrapGeneratorWithSave(
      generator,
      dto.conversationId,
      () => {},
    );

    return this.streamToObservable(wrappedGenerator);
  }

  /**
   * 包装 generator 以在流结束时保存 AI 响应
   */
  private async *wrapGeneratorWithSave(
    generator: AsyncGenerator<StreamEvent>,
    conversationId: string | undefined,
    onContent: (content: string, sessionId: string) => void,
  ): AsyncGenerator<StreamEvent> {
    let fullContent = '';
    let sessionId = '';

    try {
      for await (const event of generator) {
        // 收集内容
        if (event.type === 'content' && event.content) {
          fullContent += event.content;
        }
        if (event.type === 'conversation_id' && event.conversationId) {
          sessionId = event.conversationId;
        }

        yield event;
      }

      // 流结束后保存 AI 响应
      if (conversationId && fullContent) {
        try {
          await this.conversationService.addMessage(
            conversationId,
            'assistant',
            fullContent,
          );
        } catch (err) {
          console.error('保存 AI 响应失败:', err);
        }
      }

      onContent(fullContent, sessionId);
    } catch (error) {
      yield { type: 'error', error: String(error) };
    }
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
   * 格式化健康数据为消息
   */
  private formatHealthDataMessage(data: {
    bloodPressure?: string;
    heartRate?: string;
    bloodSugar?: string;
    weight?: string;
    height?: string;
    age?: number;
    sleepHours?: number;
    exerciseMinutes?: number;
  }): string {
    const lines: string[] = ['请帮我分析以下健康数据：'];

    if (data.bloodPressure) {
      lines.push(`- 血压：${data.bloodPressure}`);
    }
    if (data.heartRate) {
      lines.push(`- 心率：${data.heartRate}`);
    }
    if (data.bloodSugar) {
      lines.push(`- 血糖：${data.bloodSugar}`);
    }
    if (data.weight) {
      lines.push(`- 体重：${data.weight}`);
    }
    if (data.height) {
      lines.push(`- 身高：${data.height}`);
    }
    if (data.age) {
      lines.push(`- 年龄：${data.age}岁`);
    }
    if (data.sleepHours !== undefined) {
      lines.push(`- 睡眠时长：${data.sleepHours}小时`);
    }
    if (data.exerciseMinutes !== undefined) {
      lines.push(`- 每日运动：${data.exerciseMinutes}分钟`);
    }

    return lines.join('\n');
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
