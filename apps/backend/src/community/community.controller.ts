import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CommunityService } from './community.service';
import { AddCommunityCommentDto } from './dto/add-community-comment.dto';
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
    const images = body.images ?? [];

    if (!contentText && images.length === 0) {
      throw new BadRequestException('Content or images are required');
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
      images,
    });
    return { post };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('community/posts/:id')
  async updatePost(
    @Req()
    request: {
      user?: { id?: string };
    },
    @Param('id') id: string,
    @Body() body: CreateCommunityPostDto,
  ) {
    const user = request.user;
    if (!user?.id) {
      throw new UnauthorizedException('Invalid user');
    }

    const post = await this.communityService.updatePost({
      userId: user.id,
      postId: id,
      contentJson: body.contentJson,
      contentText: body.contentText,
      images: body.images,
    });
    return { post };
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete('community/posts/:id')
  async deletePost(
    @Req()
    request: {
      user?: { id?: string };
    },
    @Param('id') id: string,
  ) {
    const user = request.user;
    if (!user?.id) {
      throw new UnauthorizedException('Invalid user');
    }

    return await this.communityService.deletePost(user.id, id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('community/posts/:id/like')
  async toggleLike(
    @Req()
    request: {
      user?: { id?: string };
    },
    @Param('id') id: string,
  ) {
    const user = request.user;
    if (!user?.id) {
      throw new UnauthorizedException('Invalid user');
    }

    return await this.communityService.toggleLike(user.id, id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('community/posts/:id/comments')
  async addComment(
    @Req()
    request: {
      user?: { id?: string; email?: string | null };
    },
    @Param('id') id: string,
    @Body() body: AddCommunityCommentDto,
  ) {
    const user = request.user;
    if (!user?.id) {
      throw new UnauthorizedException('Invalid user');
    }

    const content = (body.content ?? '').trim();
    if (!content) {
      throw new BadRequestException('content is required');
    }
    if (content.length > 1000) {
      throw new BadRequestException('content is too long');
    }

    const result = await this.communityService.addComment({
      userId: user.id,
      email: user.email,
      postId: id,
      content,
    });

    return result;
  }
}
