CREATE TYPE "public"."assistant_action_status" AS ENUM('previewed', 'applied', 'rejected', 'failed');--> statement-breakpoint
CREATE TABLE "assistant_action_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"actor_user_id" uuid,
	"lead_id" uuid,
	"tool_name" text NOT NULL,
	"status" "assistant_action_status" NOT NULL,
	"summary" text NOT NULL,
	"preview" jsonb NOT NULL,
	"result" jsonb,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assistant_action_logs" ADD CONSTRAINT "assistant_action_logs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assistant_action_logs" ADD CONSTRAINT "assistant_action_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assistant_action_logs" ADD CONSTRAINT "assistant_action_logs_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assistant_action_logs_workspace_id_idx" ON "assistant_action_logs" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "assistant_action_logs_lead_id_idx" ON "assistant_action_logs" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "assistant_action_logs_status_idx" ON "assistant_action_logs" USING btree ("status");
