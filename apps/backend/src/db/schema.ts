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

/**
 * 登录尝试记录表 - 用于暴力破解检测
 */
export const loginAttempts = pgTable('login_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  ipAddress: text('ip_address').notNull(),
  email: text('email'),
  success: boolean('success').default(false).notNull(),
  failureReason: text('failure_reason'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

/**
 * IP封禁记录表
 */
export const ipBans = pgTable('ip_bans', {
  id: uuid('id').defaultRandom().primaryKey(),
  ipAddress: text('ip_address').notNull(),
  reason: text('reason').notNull(),
  bannedBy: uuid('banned_by'), // 管理员ID（可选，自动封禁时为null）
  autoBlocked: boolean('auto_blocked').default(false).notNull(),
  expiresAt: timestamp('expires_at', { mode: 'date' }), // 过期时间，null表示永久封禁
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

/**
 * 安全事件日志表
 */
export const securityLogs = pgTable('security_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: text('type').notNull(), // 'brute_force', 'api_abuse', 'spam', 'ip_blocked'
  severity: text('severity').notNull(), // 'low', 'medium', 'high', 'critical'
  ipAddress: text('ip_address'),
  userId: uuid('user_id'),
  endpoint: text('endpoint'),
  details: json('details').$type<Record<string, any>>(),
  actionTaken: text('action_taken'), // 'blocked', 'rate_limited', 'disconnected'
  resolved: boolean('resolved').default(false).notNull(),
  resolvedAt: timestamp('resolved_at', { mode: 'date' }),
  resolvedBy: uuid('resolved_by'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

/**
 * WebSocket 事件日志表 - 记录连接、断开、消息事件
 */
export const websocketEvents = pgTable('websocket_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventType: text('event_type').notNull(), // 'connect', 'disconnect', 'message', 'spam_detected'
  socketId: text('socket_id').notNull(),
  userId: uuid('user_id'),
  userName: text('user_name'), // 用户名快照
  ipAddress: text('ip_address'),
  roomId: text('room_id'),
  messagePreview: text('message_preview'), // 消息预览（仅 message 事件）
  messageCount: text('message_count').default('0'), // 刷屏时的消息计数
  reason: text('reason'), // 断开原因或刷屏原因
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
