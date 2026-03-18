import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DbService } from '../db/db.service';
import { profiles } from '../db/schema';

type UpdateProfileInput = {
  name?: string;
  avatarUrl?: string;
};

@Injectable()
export class ProfileService {
  constructor(private readonly dbService: DbService) {}

  // 获取用户个人资料
  async getProfile(userId: string) {
    const rows = await this.dbService.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    return rows[0] ?? null;
  }

  // 更新用户个人资料
  async upsertProfile(userId: string, payload: UpdateProfileInput) {
    const updateSet: {
      name?: string | null;
      avatarUrl?: string | null;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (payload.name !== undefined) {
      updateSet.name = payload.name;
    }
    if (payload.avatarUrl !== undefined) {
      updateSet.avatarUrl = payload.avatarUrl;
    }

    await this.dbService.db
      .insert(profiles)
      .values({
        userId,
        name: payload.name ?? null,
        avatarUrl: payload.avatarUrl ?? null,
      })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: updateSet,
      });

    return this.getProfile(userId);
  }
}
