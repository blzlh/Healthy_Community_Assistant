CREATE TABLE "ip_bans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_address" text NOT NULL,
	"reason" text NOT NULL,
	"banned_by" uuid,
	"auto_blocked" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_address" text NOT NULL,
	"email" text,
	"success" boolean DEFAULT false NOT NULL,
	"failure_reason" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"severity" text NOT NULL,
	"ip_address" text,
	"user_id" uuid,
	"endpoint" text,
	"details" json,
	"action_taken" text,
	"resolved" boolean DEFAULT false NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "websocket_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"socket_id" text NOT NULL,
	"user_id" uuid,
	"ip_address" text,
	"room_id" text,
	"message_preview" text,
	"message_count" text DEFAULT '0',
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
