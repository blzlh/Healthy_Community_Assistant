import { Injectable } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DbService } from '../db/db.service';
import { profiles } from '../db/schema';

type UpdateProfileInput = {
  email?: string;
  name?: string;
  avatarUrl?: string | null;
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
      email?: string | null;
      name?: string | null;
      avatarUrl?: string | null;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (payload.email !== undefined) {
      updateSet.email = payload.email;
    }
    if (payload.name !== undefined) {
      updateSet.name = payload.name?.trim() || payload.email || null;
    }
    if (payload.avatarUrl !== undefined) {
      updateSet.avatarUrl = payload.avatarUrl;
    }

    await this.dbService.db
      .insert(profiles)
      .values({
        userId,
        email: payload.email ?? null,
        name: payload.name?.trim() || payload.email || null,
        avatarUrl: payload.avatarUrl ?? null,
      })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: updateSet,
      });

    return this.getProfile(userId);
  }

  // 设置封禁状态
  async setBanStatus(userId: string, isBanned: boolean) {
    await this.dbService.db
      .update(profiles)
      .set({ isBanned, updatedAt: new Date() })
      .where(eq(profiles.userId, userId));
    return this.getProfile(userId);
  }

  // 获取所有用户资料（仅管理员可用）
  async listAllProfiles() {
    return this.dbService.db
      .select()
      .from(profiles)
      .orderBy(desc(profiles.createdAt));
  }
}
