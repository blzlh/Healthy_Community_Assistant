CREATE TABLE "api_abuse_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"endpoint" text NOT NULL,
	"method" text NOT NULL,
	"ip_address" text NOT NULL,
	"user_id" uuid,
	"user_name" text,
	"qps" text NOT NULL,
	"duration" text NOT NULL,
	"action_taken" text NOT NULL,
	"rate_limit_duration" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
