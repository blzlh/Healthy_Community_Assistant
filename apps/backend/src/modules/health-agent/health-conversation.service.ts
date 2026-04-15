/**
 * 健康对话服务 - 处理对话历史和健康记录的数据库操作
 */

import { Injectable, Logger } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { DbService } from '@/db/db.service';
import { healthConversations, healthMessages, healthRecords } from '@/db/schema';

export interface HealthData {
  bloodPressure?: string;
  heartRate?: string;
  bloodSugar?: string;
  weight?: string;
  height?: string;
  age?: string;
}

export interface ConversationWithMessages {
  id: string;
  userId: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  messages: {
    id: string;
    role: string;
    content: string;
    healthDataSnapshot: HealthData | null;
    createdAt: Date;
  }[];
}

@Injectable()
export class HealthConversationService {
  private readonly logger = new Logger(HealthConversationService.name);

  constructor(private readonly dbService: DbService) { }

  /**
   * 创建新对话
   */
  async createConversation(userId: string, title?: string): Promise<string> {
    try {
      this.logger.log(`Creating conversation for userId: ${userId}`);

      const result = await this.dbService.db
        .insert(healthConversations)
        .values({
          userId,
          title: title || null,
        })
        .returning({ id: healthConversations.id });

      this.logger.log(`Created conversation with id: ${result[0].id}`);
      return result[0].id;
    } catch (error) {
      this.logger.error(`Failed to create conversation: ${error}`);
      throw error;
    }
  }

  /**
   * 获取用户的所有对话列表
   */
  async getConversationsByUser(userId: string, limit = 20) {
    const conversations = await this.dbService.db
      .select()
      .from(healthConversations)
      .where(eq(healthConversations.userId, userId))
      .orderBy(desc(healthConversations.updatedAt))
      .limit(limit);

    return conversations;
  }

  /**
   * 获取对话详情（包含所有消息）
   */
  async getConversationWithMessages(
    conversationId: string,
    userId: string,
  ): Promise<ConversationWithMessages | null> {
    // 获取对话信息
    const conversations = await this.dbService.db
      .select()
      .from(healthConversations)
      .where(
        and(
          eq(healthConversations.id, conversationId),
          eq(healthConversations.userId, userId),
        ),
      )
      .limit(1);

    if (conversations.length === 0) {
      return null;
    }

    const conversation = conversations[0];

    // 获取消息列表
    const messages = await this.dbService.db
      .select()
      .from(healthMessages)
      .where(eq(healthMessages.conversationId, conversationId))
      .orderBy(healthMessages.createdAt);

    return {
      ...conversation,
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        healthDataSnapshot: m.healthDataSnapshot as HealthData | null,
        createdAt: m.createdAt,
      })),
    };
  }

  /**
   * 添加消息到对话
   */
  async addMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    healthDataSnapshot?: HealthData,
  ): Promise<string> {
    const result = await this.dbService.db
      .insert(healthMessages)
      .values({
        conversationId,
        role,
        content,
        healthDataSnapshot: healthDataSnapshot || null,
      })
      .returning({ id: healthMessages.id });

    // 更新对话的 updatedAt 时间
    await this.dbService.db
      .update(healthConversations)
      .set({ updatedAt: new Date() })
      .where(eq(healthConversations.id, conversationId));

    return result[0].id;
  }

  /**
   * 更新对话标题
   */
  async updateConversationTitle(
    conversationId: string,
    userId: string,
    title: string,
  ): Promise<boolean> {
    const result = await this.dbService.db
      .update(healthConversations)
      .set({ title, updatedAt: new Date() })
      .where(
        and(
          eq(healthConversations.id, conversationId),
          eq(healthConversations.userId, userId),
        ),
      )
      .returning({ id: healthConversations.id });

    return result.length > 0;
  }

  /**
   * 删除对话（同时删除所有消息）
   */
  async deleteConversation(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    // 先删除消息
    await this.dbService.db
      .delete(healthMessages)
      .where(eq(healthMessages.conversationId, conversationId));

    // 再删除对话
    const result = await this.dbService.db
      .delete(healthConversations)
      .where(
        and(
          eq(healthConversations.id, conversationId),
          eq(healthConversations.userId, userId),
        ),
      )
      .returning({ id: healthConversations.id });

    return result.length > 0;
  }

  /**
   * 保存健康记录
   */
  async saveHealthRecord(
    userId: string,
    healthData: HealthData,
    conversationId?: string,
    notes?: string,
  ): Promise<string> {
    const result = await this.dbService.db
      .insert(healthRecords)
      .values({
        userId,
        conversationId: conversationId || null,
        bloodPressure: healthData.bloodPressure || null,
        heartRate: healthData.heartRate || null,
        bloodSugar: healthData.bloodSugar || null,
        weight: healthData.weight || null,
        height: healthData.height || null,
        age: healthData.age || null,
        notes: notes || null,
      })
      .returning({ id: healthRecords.id });

    return result[0].id;
  }

  /**
   * 获取用户的健康记录历史
   */
  async getHealthRecordsByUser(userId: string, limit = 30) {
    const records = await this.dbService.db
      .select()
      .from(healthRecords)
      .where(eq(healthRecords.userId, userId))
      .orderBy(desc(healthRecords.createdAt))
      .limit(limit);

    return records;
  }

  /**
   * 获取对话关联的健康记录
   */
  async getHealthRecordsByConversation(conversationId: string) {
    const records = await this.dbService.db
      .select()
      .from(healthRecords)
      .where(eq(healthRecords.conversationId, conversationId))
      .orderBy(desc(healthRecords.createdAt));

    return records;
  }
}
