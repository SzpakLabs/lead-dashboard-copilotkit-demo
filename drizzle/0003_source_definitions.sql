ALTER TYPE "public"."event_target_type" ADD VALUE IF NOT EXISTS 'source_definition';--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "source" TYPE text USING "source"::text;--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "source" SET DEFAULT 'other';--> statement-breakpoint
ALTER TABLE "ingestion_events" ALTER COLUMN "source_channel" TYPE text USING "source_channel"::text;--> statement-breakpoint
ALTER TABLE "ingestion_events" ALTER COLUMN "source_channel" SET DEFAULT 'other';--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "source" TYPE text USING "source"::text;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "source" SET DEFAULT 'other';--> statement-breakpoint
CREATE TABLE "source_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"preset_key" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "source_definitions" ADD CONSTRAINT "source_definitions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "source_definitions_workspace_id_idx" ON "source_definitions" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "source_definitions_workspace_slug_idx" ON "source_definitions" USING btree ("workspace_id","slug");
