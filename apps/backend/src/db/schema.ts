import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  userId: uuid('user_id').primaryKey(), // 用户ID，与Auth表中的用户ID关联
  email: text('email'), // 用户邮箱
  name: text('name'), // 用户姓名
  avatarUrl: text('avatar_url'), // 用户头像URL
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(), // 创建时间
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(), // 更新时间
});

export const chatHistory = pgTable('chat_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomId: text('room_id').notNull(),
  userId: uuid('user_id').notNull(),
  name: text('name'),
  text: text('text').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
