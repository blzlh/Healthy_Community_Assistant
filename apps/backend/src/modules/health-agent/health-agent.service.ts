/**
 * AI健康助手 Agent 服务
 * 调用 Coze 平台的 Bot API (v3) 进行健康数据分析
 * 支持流式输出
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

interface HealthData {
  bloodPressure?: string;   // 血压，如 "120/80 mmHg"
  heartRate?: string;       // 心率，如 "72次/分钟"
  bloodSugar?: string;      // 血糖，如 "5.5 mmol/L"
  weight?: string;          // 体重，如 "70kg"
  height?: string;          // 身高，如 "175cm"
  age?: number;             // 年龄
  sleepHours?: number;      // 睡眠时长（小时）
  exerciseMinutes?: number; // 运动时长（分钟）
}

export interface AnalysisResult {
  content: string;
  conversationId: string;
}

// 流式响应事件类型
export interface StreamEvent {
  type: 'content' | 'conversation_id' | 'done' | 'error';
  content?: string;
  conversationId?: string;
  error?: string;
}

@Injectable()
export class HealthAgentService {
  private readonly logger = new Logger(HealthAgentService.name);
  private readonly cozeApiUrl = 'https://api.coze.cn/v3/chat';
  private readonly cozeApiKey: string;
  private readonly cozeBotId: string;

  constructor(private configService: ConfigService) {
    this.cozeApiKey = this.configService.get<string>('COZE_API_KEY') || '';
    this.cozeBotId = this.configService.get<string>('COZE_BOT_ID') || '';
  }

  /**
   * 分析健康数据 - 流式输出
   * 返回一个 AsyncGenerator，每次 yield 一个 StreamEvent
   */
  async *analyzeHealthDataStream(
    healthData: HealthData,
    conversationId?: string
  ): AsyncGenerator<StreamEvent> {
    const message = this.formatHealthDataMessage(healthData);

    try {
      yield* this.callCozeApiStream(message, conversationId);
    } catch (error) {
      this.logger.error('Failed to analyze health data', error);
      yield { type: 'error', error: '健康数据分析失败，请稍后重试' };
    }
  }

  /**
   * 多轮对话 - 流式输出
   */
  async *continueConversationStream(
    question: string,
    conversationId: string
  ): AsyncGenerator<StreamEvent> {
    try {
      yield* this.callCozeApiStream(question, conversationId);
    } catch (error) {
      this.logger.error('Failed to continue conversation', error);
      yield { type: 'error', error: '对话失败，请稍后重试' };
    }
  }

  /**
   * 调用 Coze API v3 (流式响应) - 返回 AsyncGenerator
   */
  private async *callCozeApiStream(
    message: string,
    conversationId?: string
  ): AsyncGenerator<StreamEvent> {
    this.logger.log(`Calling Coze API v3 (stream) for bot: ${this.cozeBotId}`);
    this.logger.debug(`Message: ${message}`);

    const body: Record<string, any> = {
      bot_id: this.cozeBotId,
      user_id: 'health-user',
      stream: true,
      additional_messages: [
        {
          role: 'user',
          content: message,
          content_type: 'text',
        },
      ],
    };

    if (conversationId) {
      body.conversation_id = conversationId;
    }

    const response = await fetch(this.cozeApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cozeApiKey}`,
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Coze API error: ${response.status} - ${errorText}`);
      throw new Error(`Coze API error: ${response.status}`);
    }

    yield* this.parseStreamResponseToEvents(response);
  }

  /**
   * 解析 Coze 流式响应，转换为 StreamEvent 流
   */
  private async *parseStreamResponseToEvents(response: Response): AsyncGenerator<StreamEvent> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let conversationId = '';
    let currentEvent = '';
    let accumulatedContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();

          if (trimmedLine.startsWith('event:')) {
            currentEvent = trimmedLine.slice(6).trim();
            continue;
          }

          if (trimmedLine.startsWith('data:')) {
            const dataStr = trimmedLine.slice(5).trim();

            if (dataStr === '"[DONE]"' || dataStr === '[DONE]') {
              // 流结束，发送最终事件
              yield { type: 'done' };
              continue;
            }

            try {
              const data = JSON.parse(dataStr);

              // 提取并返回 conversation_id
              if (data.conversation_id && !conversationId) {
                conversationId = data.conversation_id;
                yield { type: 'conversation_id', conversationId };
              }

              // 处理增量消息 (delta)
              if (
                currentEvent === 'conversation.message.delta' &&
                data.role === 'assistant' &&
                data.type === 'answer' &&
                data.content
              ) {
                // 每次收到增量内容，立即 yield
                yield { type: 'content', content: data.content };
                accumulatedContent += data.content;
              }

              // 处理完成消息 (completed) - 用于获取最终完整内容
              if (
                currentEvent === 'conversation.message.completed' &&
                data.role === 'assistant' &&
                data.type === 'answer'
              ) {
                // 如果有完整内容但之前没有收到 delta，则发送完整内容
                if (data.content && !accumulatedContent) {
                  yield { type: 'content', content: data.content };
                }
              }
            } catch (e) {
              // 忽略 JSON 解析错误
            }
          }
        }
      }

      // 如果流结束但没有收到 done 事件
      if (conversationId) {
        yield { type: 'done' };
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * 格式化健康数据为消息
   */
  private formatHealthDataMessage(data: HealthData): string {
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
   * 健康检查
   */
  async checkHealth(): Promise<boolean> {
    if (!this.cozeApiKey || !this.cozeBotId) {
      this.logger.error('Coze API Key or Bot ID is not configured');
      return false;
    }
    return true;
  }
}
