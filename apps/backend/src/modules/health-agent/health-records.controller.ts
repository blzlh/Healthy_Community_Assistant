/**
 * 健康记录控制器 - 提供 CRUD API
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseUUIDPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import { HealthRecordsService } from './health-records.service';
import type { CreateHealthRecordInput } from './health-records.service';

@ApiTags('健康记录')
@Controller('health-records')
@UseGuards(SupabaseAuthGuard)
export class HealthRecordsController {
  constructor(private readonly recordsService: HealthRecordsService) {}

  /**
   * 创建健康记录
   * POST /health-records
   */
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建健康记录', description: '添加一条新的健康数据记录' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async createRecord(
    @Request() req: any,
    @Body() data: CreateHealthRecordInput,
  ) {
    const userId = req.user.id;
    const recordId = await this.recordsService.createRecord(userId, data);
    return {
      success: true,
      data: { recordId },
    };
  }

  /**
   * 获取健康记录列表
   * GET /health-records
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取健康记录列表', description: '获取当前用户的健康记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getRecords(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = req.user.id;
    const records = await this.recordsService.getRecordsByUser(userId, {
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      startDate,
      endDate,
    });
    return {
      success: true,
      data: records,
    };
  }

  /**
   * 获取单条记录
   * GET /health-records/:id
   */
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取单条记录', description: '根据 ID 获取健康记录详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '记录不存在' })
  async getRecord(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) recordId: string,
  ) {
    const userId = req.user.id;
    const record = await this.recordsService.getRecordById(recordId, userId);
    return {
      success: true,
      data: record,
    };
  }

  /**
   * 更新健康记录
   * PATCH /health-records/:id
   */
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新健康记录', description: '更新指定的健康记录' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '记录不存在' })
  async updateRecord(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) recordId: string,
    @Body() data: Partial<CreateHealthRecordInput>,
  ) {
    const userId = req.user.id;
    const success = await this.recordsService.updateRecord(recordId, userId, data);
    if (!success) {
      throw new HttpException('更新失败', HttpStatus.BAD_REQUEST);
    }
    return {
      success: true,
      message: '更新成功',
    };
  }

  /**
   * 删除健康记录
   * DELETE /health-records/:id
   */
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除健康记录', description: '删除指定的健康记录' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '记录不存在' })
  async deleteRecord(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) recordId: string,
  ) {
    const userId = req.user.id;
    const success = await this.recordsService.deleteRecord(recordId, userId);
    if (!success) {
      throw new HttpException('删除失败', HttpStatus.BAD_REQUEST);
    }
    return {
      success: true,
      message: '删除成功',
    };
  }
}
