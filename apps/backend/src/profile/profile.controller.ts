import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // 获取用户个人资料
  @UseGuards(SupabaseAuthGuard)
  @Get('profile')
  async getProfile(
    @Req()
    request: {
      user?: { id?: string; email?: string };
    },
  ) {
    const user = request.user;
    if (!user?.id) {
      throw new UnauthorizedException('Invalid user');
    }
    const profile = await this.profileService.getProfile(user.id);
    // 注意：不再自动创建 profile，profile 应该在登录时由 auth.service 创建
    return {
      user: {
        id: user.id,
        email: user.email,
        name: profile?.name ?? null,
        avatarUrl: profile?.avatarUrl ?? null,
        isAdmin: profile?.isAdmin ?? false,
        isBanned: profile?.isBanned ?? false,
      },
    };
  }

  // 更新用户个人资料
  @UseGuards(SupabaseAuthGuard)
  @Put('profile')
  async updateProfile(
    @Req()
    request: {
      user?: { id?: string; email?: string };
    },
    @Body() body: UpdateProfileDto,
  ) {
    const user = request.user;
    if (!user?.id) {
      throw new UnauthorizedException('Invalid user');
    }
    if (body.name === undefined && body.avatarUrl === undefined) {
      throw new BadRequestException('name or avatarUrl is required');
    }
    const profile = await this.profileService.upsertProfile(user.id, {
      email: user.email,
      name: body.name,
      avatarUrl: body.avatarUrl,
    });
    return {
      user: {
        id: user.id,
        email: user.email,
        name: profile?.name ?? null,
        avatarUrl: profile?.avatarUrl ?? null,
        isAdmin: profile?.isAdmin ?? false,
        isBanned: profile?.isBanned ?? false,
      },
    };
  }

  // 管理员封禁/解封用户
  @UseGuards(SupabaseAuthGuard)
  @Put('admin/ban')
  async setBanStatus(
    @Req()
    request: {
      user?: { id?: string; email?: string };
    },
    @Body() body: { targetUserId: string; isBanned: boolean },
  ) {
    const user = request.user;
    if (!user?.id) {
      throw new UnauthorizedException('Invalid user');
    }

    // 检查当前用户是否是管理员
    const adminProfile = await this.profileService.getProfile(user.id);
    if (!adminProfile?.isAdmin) {
      throw new ForbiddenException('Only admins can ban users');
    }

    if (!body.targetUserId) {
      throw new BadRequestException('targetUserId is required');
    }

    await this.profileService.setBanStatus(body.targetUserId, body.isBanned);
    return { success: true };
  }

  // 获取所有用户资料（仅管理员可用）
  @UseGuards(SupabaseAuthGuard)
  @Get('admin/users')
  async listUsers(
    @Req()
    request: {
      user?: { id?: string; email?: string };
    },
  ) {
    const user = request.user;
    if (!user?.id) {
      throw new UnauthorizedException('Invalid user');
    }

    // 检查当前用户是否是管理员
    const adminProfile = await this.profileService.getProfile(user.id);
    if (!adminProfile?.isAdmin) {
      throw new ForbiddenException('Only admins can view user list');
    }

    const profiles = await this.profileService.listAllProfiles();
    return {
      users: profiles.map((p) => ({
        id: p.userId,
        email: p.email,
        name: p.name,
        avatarUrl: p.avatarUrl,
        isAdmin: p.isAdmin,
        isBanned: p.isBanned,
        createdAt: p.createdAt.toISOString(),
      })),
    };
  }
}
