import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CommunityService } from './community.service';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';

@Controller()
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @UseGuards(SupabaseAuthGuard)
  @Get('community/posts')
  async listPosts(
    @Req()
    request: {
      user?: { id?: string };
    },
    @Query('scope') scope?: string,
  ) {
    const user = request.user;
    if (!user?.id) {
      throw new UnauthorizedException('Invalid user');
    }

    const mine = (scope ?? '').toLowerCase() === 'mine';
    const posts = await this.communityService.listPosts({
      userId: user.id,
      mine,
    });
    return { posts };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('community/posts')
  async createPost(
    @Req()
    request: {
      user?: { id?: string; email?: string | null };
    },
    @Body() body: CreateCommunityPostDto,
  ) {
    const user = request.user;
    if (!user?.id) {
      throw new UnauthorizedException('Invalid user');
    }

    const contentText = (body.contentText ?? '').trim();
    if (!contentText) {
      throw new BadRequestException('contentText is required');
    }
    if (contentText.length > 5000) {
      throw new BadRequestException('contentText is too long');
    }

    if (!body.contentJson || typeof body.contentJson !== 'object') {
      throw new BadRequestException('contentJson is required');
    }

    const post = await this.communityService.createPost({
      userId: user.id,
      email: user.email,
      contentJson: body.contentJson,
      contentText,
    });
    return { post };
  }
}
