/**
 * 安全防护控制器 - 提供安全监控 API
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SecurityService } from './security.service';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import { ProfileService } from '@/profile/profile.service';

@ApiTags('安全监控')
@Controller('security')
@UseGuards(SupabaseAuthGuard)
export class SecurityController {
  constructor(
    private readonly securityService: SecurityService,
    private readonly profileService: ProfileService,
  ) {}

  /**
   * 检查管理员权限
   */
  private async checkAdmin(userId: string): Promise<void> {
    const profile = await this.profileService.getProfile(userId);
    if (!profile?.isAdmin) {
      throw new HttpException('需要管理员权限', HttpStatus.FORBIDDEN);
    }
  }

  /**
   * 获取安全统计信息
   * GET /security/statistics
   */
  @Get('statistics')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取安全统计信息', description: '获取今日安全事件统计数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权限' })
  async getStatistics(@Request() req: any) {
    await this.checkAdmin(req.user.id);

    const statistics = await this.securityService.getStatistics();
    return {
      success: true,
      data: statistics,
    };
  }

  /**
   * 获取登录尝试记录
   * GET /security/login-attempts
   */
  @Get('login-attempts')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取登录尝试记录', description: '获取登录尝试历史记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getLoginAttempts(
    @Request() req: any,
    @Query('ipAddress') ipAddress?: string,
    @Query('limit') limit?: string,
  ) {
    await this.checkAdmin(req.user.id);

    const attempts = await this.securityService.getLoginAttempts(
      ipAddress,
      limit ? parseInt(limit, 10) : 100,
    );
    return {
      success: true,
      data: attempts,
    };
  }

  /**
   * 获取封禁 IP 列表
   * GET /security/blocked-ips
   */
  @Get('blocked-ips')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取封禁IP列表', description: '获取当前被封禁的IP列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getBlockedIps(@Request() req: any, @Query('limit') limit?: string) {
    await this.checkAdmin(req.user.id);

    const blockedIps = await this.securityService.getBlockedIps(
      limit ? parseInt(limit, 10) : 100,
    );
    return {
      success: true,
      data: blockedIps,
    };
  }

  /**
   * 手动封禁 IP
   * POST /security/block-ip
   */
  @Post('block-ip')
  @ApiBearerAuth()
  @ApiOperation({ summary: '封禁IP', description: '手动封禁指定IP地址' })
  @ApiResponse({ status: 200, description: '封禁成功' })
  async blockIp(
    @Request() req: any,
    @Body() body: { ipAddress: string; reason: string; durationMinutes?: number },
  ) {
    await this.checkAdmin(req.user.id);

    if (!body.ipAddress || !body.reason) {
      throw new HttpException('IP地址和原因不能为空', HttpStatus.BAD_REQUEST);
    }

    await this.securityService.blockIp(
      body.ipAddress,
      body.reason,
      false, // 手动封禁
      req.user.id,
      body.durationMinutes ? body.durationMinutes * 60 : undefined,
    );

    return {
      success: true,
      message: `IP ${body.ipAddress} 已被封禁`,
    };
  }

  /**
   * 解封 IP
   * DELETE /security/block-ip/:ip
   */
  @Delete('block-ip/:ip')
  @ApiBearerAuth()
  @ApiOperation({ summary: '解封IP', description: '解除IP封禁' })
  @ApiResponse({ status: 200, description: '解封成功' })
  async unblockIp(@Request() req: any, @Param('ip') ipAddress: string) {
    await this.checkAdmin(req.user.id);

    const success = await this.securityService.unblockIp(ipAddress);

    if (success) {
      return {
        success: true,
        message: `IP ${ipAddress} 已解封`,
      };
    } else {
      throw new HttpException('解封失败，IP可能不存在或已过期', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * 检查 IP 封禁状态
   * GET /security/check-ip/:ip
   */
  @Get('check-ip/:ip')
  @ApiBearerAuth()
  @ApiOperation({ summary: '检查IP封禁状态', description: '检查指定IP是否被封禁' })
  @ApiResponse({ status: 200, description: '检查成功' })
  async checkIpStatus(@Request() req: any, @Param('ip') ipAddress: string) {
    await this.checkAdmin(req.user.id);

    const result = await this.securityService.isIpBlocked(ipAddress);
    return {
      success: true,
      data: {
        ipAddress,
        ...result,
      },
    };
  }

  /**
   * 获取安全事件日志
   * GET /security/logs
   */
  @Get('logs')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取安全事件日志', description: '获取安全事件日志列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSecurityLogs(
    @Request() req: any,
    @Query('type') type?: string,
    @Query('severity') severity?: string,
    @Query('resolved') resolved?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    await this.checkAdmin(req.user.id);

    const logs = await this.securityService.getSecurityLogs({
      type,
      severity,
      resolved: resolved ? resolved === 'true' : undefined,
      limit: limit ? parseInt(limit, 10) : 100,
      offset: offset ? parseInt(offset, 10) : 0,
    });

    return {
      success: true,
      data: logs,
    };
  }

  /**
   * 解决安全事件
   * POST /security/logs/:id/resolve
   */
  @Post('logs/:id/resolve')
  @ApiBearerAuth()
  @ApiOperation({ summary: '解决安全事件', description: '标记安全事件为已解决' })
  @ApiResponse({ status: 200, description: '操作成功' })
  async resolveSecurityEvent(@Request() req: any, @Param('id') logId: string) {
    await this.checkAdmin(req.user.id);

    const success = await this.securityService.resolveSecurityEvent(logId, req.user.id);

    if (success) {
      return {
        success: true,
        message: '安全事件已标记为已解决',
      };
    } else {
      throw new HttpException('操作失败，事件可能不存在', HttpStatus.NOT_FOUND);
    }
  }

  // ==================== WebSocket 事件日志相关接口 ====================

  /**
   * 获取 WebSocket 事件日志
   * GET /security/websocket-events
   */
  @Get('websocket-events')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取WebSocket事件日志', description: '获取WebSocket连接、断开、刷屏事件日志' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWebSocketEvents(
    @Request() req: any,
    @Query('eventType') eventType?: string,
    @Query('socketId') socketId?: string,
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    await this.checkAdmin(req.user.id);

    const events = await this.securityService.getWebSocketEvents({
      eventType,
      socketId,
      userId,
      limit: limit ? parseInt(limit, 10) : 100,
      offset: offset ? parseInt(offset, 10) : 0,
    });

    return {
      success: true,
      data: events,
    };
  }

  /**
   * 获取 WebSocket 统计信息
   * GET /security/websocket-statistics
   */
  @Get('websocket-statistics')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取WebSocket统计信息', description: '获取今日WebSocket连接、断开、刷屏统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWebSocketStatistics(@Request() req: any) {
    await this.checkAdmin(req.user.id);

    const statistics = await this.securityService.getWebSocketStatistics();
    return {
      success: true,
      data: statistics,
    };
  }
}
