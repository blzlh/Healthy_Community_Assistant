/**
 * 健康记录服务 - 处理健康记录的 CRUD 操作
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { DbService } from '@/db/db.service';
import { healthRecords } from '@/db/schema';

export interface GetHealthRecordsQuery {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

/** 健康记录输入类型 */
export type CreateHealthRecordInput = {
  bloodPressure?: string;
  heartRate?: string;
  bloodSugar?: string;
  weight?: string;
  height?: string;
  age?: string;
  notes?: string;
};

@Injectable()
export class HealthRecordsService {
  private readonly logger = new Logger(HealthRecordsService.name);

  constructor(private readonly dbService: DbService) {}

  /**
   * 创建健康记录
   */
  async createRecord(
    userId: string,
    data: CreateHealthRecordInput,
  ): Promise<string> {
    try {
      this.logger.log(`Creating health record for userId: ${userId}`);

      const result = await this.dbService.db
        .insert(healthRecords)
        .values({
          userId,
          bloodPressure: data.bloodPressure || null,
          heartRate: data.heartRate || null,
          bloodSugar: data.bloodSugar || null,
          weight: data.weight || null,
          height: data.height || null,
          age: data.age || null,
          notes: data.notes || null,
          conversationId: null,
        })
        .returning({ id: healthRecords.id });

      this.logger.log(`Created health record with id: ${result[0].id}`);
      return result[0].id;
    } catch (error) {
      this.logger.error(`Failed to create health record: ${error}`);
      throw error;
    }
  }

  /**
   * 获取用户的健康记录列表
   */
  async getRecordsByUser(
    userId: string,
    query?: GetHealthRecordsQuery,
  ) {
    const limit = query?.limit || 50;
    const offset = query?.offset || 0;

    let queryBuilder = this.dbService.db
      .select()
      .from(healthRecords)
      .where(eq(healthRecords.userId, userId))
      .$dynamic();

    // 添加日期过滤
    if (query?.startDate) {
      const startDate = new Date(query.startDate);
      queryBuilder = queryBuilder.where(
        and(
          eq(healthRecords.userId, userId),
          gte(healthRecords.createdAt, startDate),
        ),
      );
    }

    if (query?.endDate) {
      const endDate = new Date(query.endDate);
      queryBuilder = queryBuilder.where(
        and(
          eq(healthRecords.userId, userId),
          lte(healthRecords.createdAt, endDate),
        ),
      );
    }

    const records = await queryBuilder
      .orderBy(desc(healthRecords.createdAt))
      .limit(limit)
      .offset(offset);

    return records;
  }

  /**
   * 获取单条健康记录
   */
  async getRecordById(recordId: string, userId: string) {
    const records = await this.dbService.db
      .select()
      .from(healthRecords)
      .where(
        and(
          eq(healthRecords.id, recordId),
          eq(healthRecords.userId, userId),
        ),
      )
      .limit(1);

    if (records.length === 0) {
      throw new NotFoundException('健康记录不存在');
    }

    return records[0];
  }

  /**
   * 更新健康记录
   */
  async updateRecord(
    recordId: string,
    userId: string,
    data: Partial<CreateHealthRecordInput>,
  ): Promise<boolean> {
    const result = await this.dbService.db
      .update(healthRecords)
      .set({
        bloodPressure: data.bloodPressure || null,
        heartRate: data.heartRate || null,
        bloodSugar: data.bloodSugar || null,
        weight: data.weight || null,
        height: data.height || null,
        age: data.age || null,
        notes: data.notes || null,
      })
      .where(
        and(
          eq(healthRecords.id, recordId),
          eq(healthRecords.userId, userId),
        ),
      )
      .returning({ id: healthRecords.id });

    return result.length > 0;
  }

  /**
   * 删除健康记录
   */
  async deleteRecord(recordId: string, userId: string): Promise<boolean> {
    const result = await this.dbService.db
      .delete(healthRecords)
      .where(
        and(
          eq(healthRecords.id, recordId),
          eq(healthRecords.userId, userId),
        ),
      )
      .returning({ id: healthRecords.id });

    return result.length > 0;
  }
}
