import { Injectable } from '@nestjs/common';
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
};

@Injectable()
export class CommunityService {
  constructor(private readonly dbService: DbService) {}

  async listPosts(options: ListPostsOptions) {
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

    return rows.map((row) => ({
      id: row.id,
      contentJson: this.parseContentJson(row.contentJson),
      contentText: row.contentText,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      author: {
        id: row.userId,
        name: row.authorName,
        avatarUrl: row.authorAvatarUrl,
      },
    }));
  }

  async createPost(input: CreatePostInput) {
    const profile = await this.dbService.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, input.userId))
      .limit(1);

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
      })
      .returning();

    const row = inserted[0];
    return {
      id: row.id,
      contentJson: this.parseContentJson(row.contentJson),
      contentText: row.contentText,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      author: {
        id: row.userId,
        name: row.authorName,
        avatarUrl: row.authorAvatarUrl,
      },
    };
  }

  private parseContentJson(value: string): unknown {
    try {
      return JSON.parse(value);
    } catch {
      return { type: 'doc', content: [] };
    }
  }
}
