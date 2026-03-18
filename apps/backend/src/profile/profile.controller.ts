import {
  BadRequestException,
  Body,
  Controller,
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
    let profile = await this.profileService.getProfile(user.id);
    if (!profile) {
      profile = await this.profileService.upsertProfile(user.id, {
        email: user.email,
      });
    }
    return {
      user: {
        id: user.id,
        email: user.email,
        name: profile?.name ?? null,
        avatarUrl: profile?.avatarUrl ?? null,
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
      },
    };
  }
}
