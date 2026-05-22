CREATE TYPE "public"."custom_field_type" AS ENUM('text', 'number', 'boolean', 'date');--> statement-breakpoint
ALTER TYPE "public"."event_target_type" ADD VALUE 'custom_field_definition';--> statement-breakpoint
ALTER TYPE "public"."event_target_type" ADD VALUE 'custom_field_value';--> statement-breakpoint
CREATE TABLE "custom_field_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"field_type" "custom_field_type" NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_field_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"lead_id" uuid NOT NULL,
	"definition_id" uuid NOT NULL,
	"value" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "custom_field_definitions" ADD CONSTRAINT "custom_field_definitions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_field_values" ADD CONSTRAINT "custom_field_values_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_field_values" ADD CONSTRAINT "custom_field_values_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_field_values" ADD CONSTRAINT "custom_field_values_definition_id_custom_field_definitions_id_fk" FOREIGN KEY ("definition_id") REFERENCES "public"."custom_field_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "custom_field_definitions_workspace_id_idx" ON "custom_field_definitions" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "custom_field_definitions_workspace_key_idx" ON "custom_field_definitions" USING btree ("workspace_id","key");--> statement-breakpoint
CREATE INDEX "custom_field_values_workspace_id_idx" ON "custom_field_values" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "custom_field_values_lead_id_idx" ON "custom_field_values" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "custom_field_values_definition_id_idx" ON "custom_field_values" USING btree ("definition_id");--> statement-breakpoint
CREATE UNIQUE INDEX "custom_field_values_lead_definition_idx" ON "custom_field_values" USING btree ("lead_id","definition_id");