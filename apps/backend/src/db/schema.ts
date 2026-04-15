import { pgTable, text, timestamp, uuid, boolean, json } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  userId: uuid('user_id').primaryKey(), // 用户ID，与Auth表中的用户ID关联
  email: text('email'), // 用户邮箱
  name: text('name'), // 用户姓名
  avatarUrl: text('avatar_url'), // 用户头像URL
  isAdmin: boolean('is_admin').default(false).notNull(), // 是否为管理员
  isBanned: boolean('is_banned').default(false).notNull(), // 是否被封禁
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

export const communityPosts = pgTable('community_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  authorName: text('author_name').notNull(),
  authorAvatarUrl: text('author_avatar_url'),
  contentJson: text('content_json').notNull(),
  contentText: text('content_text').notNull(),
  images: text('images').array(), // 图片数组字段
  likes: text('likes').array().default([]), // 点赞用户ID数组
  comments: text('comments').array().default([]), // 评论数组字段（JSON 字符串数组）
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

/**
 * 健康对话表 - 存储用户的对话会话
 */
export const healthConversations = pgTable('health_conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  title: text('title'), // 对话标题，可由AI生成或用户自定义
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

/**
 * 健康消息表 - 存储对话中的每条消息
 */
export const healthMessages = pgTable('health_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').notNull(),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  healthDataSnapshot: json('health_data_snapshot').$type<{
    bloodPressure?: string;
    heartRate?: string;
    bloodSugar?: string;
    weight?: string;
    height?: string;
    age?: string;
  }>(), // 该消息关联的健康数据快照
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

/**
 * 健康记录表 - 按时间记录用户的健康信息
 */
export const healthRecords = pgTable('health_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  conversationId: uuid('conversation_id'), // 关联对话，可选
  bloodPressure: text('blood_pressure'),
  heartRate: text('heart_rate'),
  bloodSugar: text('blood_sugar'),
  weight: text('weight'),
  height: text('height'),
  age: text('age'),
  notes: text('notes'), // 备注
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
