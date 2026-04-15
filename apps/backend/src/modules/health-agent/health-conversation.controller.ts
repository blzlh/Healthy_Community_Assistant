/**
 * 健康对话控制器 - 处理对话历史相关的 API
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Request,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { HealthConversationService, HealthData } from './health-conversation.service';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import { RateLimiterInterceptor } from '@/security/rate-limiter.interceptor';

@Controller('health-conversations')
@UseGuards(SupabaseAuthGuard)
@UseInterceptors(RateLimiterInterceptor)
export class HealthConversationController {
  constructor(
    private readonly conversationService: HealthConversationService,
  ) {}

  /**
   * 创建新对话
   * POST /health-conversations
   */
  @Post()
  async createConversation(
    @Request() req: any,
    @Body() body: { title?: string },
  ) {
    const userId = req.user.id; // Supabase user.id
    const conversationId = await this.conversationService.createConversation(
      userId,
      body.title,
    );
    return {
      success: true,
      data: { conversationId },
    };
  }

  /**
   * 获取用户的所有对话列表
   * GET /health-conversations
   */
  @Get()
  async getConversations(@Request() req: any) {
    const userId = req.user.id; // Supabase user.id
    const conversations = await this.conversationService.getConversationsByUser(userId);
    return {
      success: true,
      data: conversations,
    };
  }

  /**
   * 获取用户的健康记录历史
   * GET /health-conversations/records/history
   * 注意：这个路由必须在 :id 之前定义
   */
  @Get('records/history')
  async getHealthRecords(@Request() req: any) {
    const userId = req.user.id; // Supabase user.id
    const records = await this.conversationService.getHealthRecordsByUser(userId);
    return {
      success: true,
      data: records,
    };
  }

  /**
   * 保存健康记录
   * POST /health-conversations/records
   */
  @Post('records')
  async saveHealthRecord(
    @Request() req: any,
    @Body() body: HealthData & { conversationId?: string; notes?: string },
  ) {
    const userId = req.user.id; // Supabase user.id
    const { conversationId, notes, ...healthData } = body;
    const recordId = await this.conversationService.saveHealthRecord(
      userId,
      healthData,
      conversationId,
      notes,
    );
    return {
      success: true,
      data: { recordId },
    };
  }

  /**
   * 获取单个对话详情（包含消息）
   * GET /health-conversations/:id
   */
  @Get(':id')
  async getConversation(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) conversationId: string,
  ) {
    const userId = req.user.id; // Supabase user.id
    const conversation = await this.conversationService.getConversationWithMessages(
      conversationId,
      userId,
    );

    if (!conversation) {
      return {
        success: false,
        error: '对话不存在',
      };
    }

    return {
      success: true,
      data: conversation,
    };
  }

  /**
   * 更新对话标题
   * PATCH /health-conversations/:id/title
   */
  @Patch(':id/title')
  async updateTitle(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Body() body: { title: string },
  ) {
    const userId = req.user.id; // Supabase user.id
    const success = await this.conversationService.updateConversationTitle(
      conversationId,
      userId,
      body.title,
    );

    return {
      success,
      message: success ? '标题更新成功' : '更新失败',
    };
  }

  /**
   * 删除对话
   * DELETE /health-conversations/:id
   */
  @Delete(':id')
  async deleteConversation(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) conversationId: string,
  ) {
    const userId = req.user.id; // Supabase user.id
    const success = await this.conversationService.deleteConversation(
      conversationId,
      userId,
    );

    return {
      success,
      message: success ? '对话已删除' : '删除失败',
    };
  }

  /**
   * 获取对话关联的健康记录
   * GET /health-conversations/:id/records
   */
  @Get(':id/records')
  async getConversationRecords(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) conversationId: string,
  ) {
    const records = await this.conversationService.getHealthRecordsByConversation(conversationId);
    return {
      success: true,
      data: records,
    };
  }
}
