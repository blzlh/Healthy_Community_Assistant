import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { desc, eq } from 'drizzle-orm';
import { DbService } from '../db/db.service';
import { communityPosts, profiles } from '../db/schema';

type ListPostsOptions = {
  userId: string;
  mine: boolean;
};

type CreatePostInput = {
  userId: string;
  email?: string | null;
  contentJson: unknown;
  contentText: string;
  images?: string[];
};

type UpdatePostInput = {
  userId: string;
  postId: string;
  contentJson?: unknown;
  contentText?: string;
  images?: string[];
};

type CommunityComment = {
  id: string;
  userId: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  content: string;
  createdAt: string;
};

@Injectable()
export class CommunityService {
  constructor(private readonly dbService: DbService) {}

  async listPosts(options: ListPostsOptions) {
    try {
      const rows = options.mine
        ? await this.dbService.db
            .select()
            .from(communityPosts)
            .where(eq(communityPosts.userId, options.userId))
            .orderBy(desc(communityPosts.createdAt))
        : await this.dbService.db
            .select()
            .from(communityPosts)
            .orderBy(desc(communityPosts.createdAt));

      if (!rows || rows.length === 0) return [];

      const posts = rows.map((row) => {
        const likes = row.likes ?? [];
        const comments = this.parseComments(row.comments);
        return {
          id: row.id,
          contentJson: this.parseContentJson(row.contentJson),
          contentText: row.contentText,
          images: row.images ?? [],
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
          author: {
            id: row.userId,
            name: row.authorName,
            avatarUrl: row.authorAvatarUrl,
          },
          likesCount: likes.length,
          isLiked: likes.includes(options.userId),
          commentsCount: comments.length,
          comments,
        };
      });

      return posts;
    } catch (error) {
      console.error('Error in listPosts:', error);
      throw error;
    }
  }

  async createPost(input: CreatePostInput) {
    const profile = await this.dbService.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, input.userId))
      .limit(1);

    if (profile[0]?.isBanned) {
      throw new ForbiddenException('Your account is banned and cannot post');
    }

    const authorName = profile[0]?.name?.trim() || input.email || '匿名用户';
    const authorAvatarUrl = profile[0]?.avatarUrl ?? null;

    const inserted = await this.dbService.db
      .insert(communityPosts)
      .values({
        userId: input.userId,
        authorName,
        authorAvatarUrl,
        contentJson: JSON.stringify(input.contentJson),
        contentText: input.contentText,
        images: input.images || [],
        likes: [],
        comments: [],
      })
      .returning();

    const row = inserted[0];
    return {
      id: row.id,
      contentJson: this.parseContentJson(row.contentJson),
      contentText: row.contentText,
      images: row.images ?? [],
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      author: {
        id: row.userId,
        name: row.authorName,
        avatarUrl: row.authorAvatarUrl,
      },
      likesCount: 0,
      isLiked: false,
      commentsCount: 0,
      comments: [],
    };
  }

  async updatePost(input: UpdatePostInput) {
    const existing = await this.dbService.db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.id, input.postId))
      .limit(1);

    if (existing.length === 0) {
      throw new NotFoundException('Post not found');
    }

    if (existing[0].userId !== input.userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const profile = await this.dbService.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, input.userId))
      .limit(1);

    if (profile[0]?.isBanned) {
      throw new ForbiddenException('Your account is banned and cannot edit posts');
    }

    const updated = await this.dbService.db
      .update(communityPosts)
      .set({
        contentJson: input.contentJson
          ? JSON.stringify(input.contentJson)
          : undefined,
        contentText: input.contentText ?? undefined,
        images: input.images ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(communityPosts.id, input.postId))
      .returning();

    const row = updated[0];
    const likes = row.likes ?? [];
    const comments = this.parseComments(row.comments);
    return {
      id: row.id,
      contentJson: this.parseContentJson(row.contentJson),
      contentText: row.contentText,
      images: row.images ?? [],
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      author: {
        id: row.userId,
        name: row.authorName,
        avatarUrl: row.authorAvatarUrl,
      },
      likesCount: likes.length,
      isLiked: likes.includes(input.userId),
      commentsCount: comments.length,
      comments,
    };
  }

  async addComment(input: {
    userId: string;
    email?: string | null;
    postId: string;
    content: string;
  }) {
    const existing = await this.dbService.db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.id, input.postId))
      .limit(1);

    if (existing.length === 0) {
      throw new NotFoundException('Post not found');
    }

    const profile = await this.dbService.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, input.userId))
      .limit(1);

    if (profile[0]?.isBanned) {
      throw new ForbiddenException('Your account is banned and cannot comment');
    }

    const authorName = profile[0]?.name?.trim() || input.email || '匿名用户';
    const authorAvatarUrl = profile[0]?.avatarUrl ?? null;

    const comment: CommunityComment = {
      id: randomUUID(),
      userId: input.userId,
      authorName,
      authorAvatarUrl,
      content: input.content,
      createdAt: new Date().toISOString(),
    };

    const currentComments = existing[0].comments ?? [];
    const nextComments = [...currentComments, JSON.stringify(comment)];

    await this.dbService.db
      .update(communityPosts)
      .set({
        comments: nextComments,
        updatedAt: new Date(),
      })
      .where(eq(communityPosts.id, input.postId));

    return { comment, commentsCount: nextComments.length };
  }

  async toggleLike(userId: string, postId: string) {
    const existing = await this.dbService.db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.id, postId))
      .limit(1);

    if (existing.length === 0) {
      throw new NotFoundException('Post not found');
    }

    const profile = await this.dbService.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (profile[0]?.isBanned) {
      throw new ForbiddenException('Your account is banned and cannot like posts');
    }

    const currentLikes = existing[0].likes ?? [];
    const isLiked = currentLikes.includes(userId);
    let newLikes: string[];

    // 切换点赞状态：如果已点赞则移除，否则添加
    if (isLiked) {
      newLikes = currentLikes.filter((id) => id !== userId);
    } else {
      newLikes = [...currentLikes, userId];
    }

    // 更新 community_posts 表中的 likes 数组字段
    await this.dbService.db
      .update(communityPosts)
      .set({
        likes: newLikes,
      })
      .where(eq(communityPosts.id, postId));

    return { isLiked: !isLiked };
  }

  private parseContentJson(value: string): unknown {
    try {
      return JSON.parse(value);
    } catch {
      return { type: 'doc', content: [] };
    }
  }

  private parseComments(value: string[] | null): CommunityComment[] {
    if (!value || value.length === 0) return [];
    const result: CommunityComment[] = [];
    for (const raw of value) {
      try {
        const parsed = JSON.parse(raw) as CommunityComment;
        if (
          parsed &&
          typeof parsed === 'object' &&
          typeof parsed.content === 'string'
        ) {
          result.push(parsed);
        }
      } catch {
        // ignore invalid comment payloads
      }
    }
    return result;
  }
}
