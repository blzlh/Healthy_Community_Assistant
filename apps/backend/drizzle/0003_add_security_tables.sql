-- 添加安全日志相关数据表
CREATE TABLE IF NOT EXISTS "login_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "ip_address" text NOT NULL,
  "email" text,
  "success" boolean NOT NULL DEFAULT false,
  "failure_reason" text,
  "user_agent" text,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "ip_bans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "ip_address" text NOT NULL,
  "reason" text NOT NULL,
  "banned_by" uuid,
  "auto_blocked" boolean NOT NULL DEFAULT false,
  "expires_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "security_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "type" text NOT NULL,
  "severity" text NOT NULL,
  "ip_address" text,
  "user_id" uuid,
  "endpoint" text,
  "details" jsonb,
  "action_taken" text,
  "resolved" boolean NOT NULL DEFAULT false,
  "resolved_at" timestamp,
  "resolved_by" uuid,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS "login_attempts_ip_address_idx" ON "login_attempts" ("ip_address");
CREATE INDEX IF NOT EXISTS "login_attempts_created_at_idx" ON "login_attempts" ("created_at");
CREATE INDEX IF NOT EXISTS "ip_bans_ip_address_idx" ON "ip_bans" ("ip_address");
CREATE INDEX IF NOT EXISTS "ip_bans_expires_at_idx" ON "ip_bans" ("expires_at");
CREATE INDEX IF NOT EXISTS "security_logs_type_idx" ON "security_logs" ("type");
CREATE INDEX IF NOT EXISTS "security_logs_created_at_idx" ON "security_logs" ("created_at");
