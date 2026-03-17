import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  userId: uuid('user_id').primaryKey(), // 用户ID，与Auth表中的用户ID关联
  name: text('name'), // 用户姓名
  avatarUrl: text('avatar_url'), // 用户头像URL
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(), // 创建时间
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(), // 更新时间
});
