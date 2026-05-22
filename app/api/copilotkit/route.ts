import {
  BuiltInAgent,
  CopilotRuntime,
  createCopilotRuntimeHandler
} from "@copilotkit/runtime/v2";
import { assistantTools } from "@/lib/assistant/tools/leads";

export const runtime = "nodejs";

const assistant = new BuiltInAgent({
  model: process.env.COPILOTKIT_MODEL ?? "openai/gpt-5.4-mini",
  tools: assistantTools,
  maxSteps: 8,
  prompt:
    "You are the lead operations dashboard assistant. Search, open leads, list internal calendar items, check availability, and draft lead mutations only in the current dashboard. Use find_leads for search requests and open_lead when the user selects or clearly identifies a lead. Use list_calendar_items for questions about what is scheduled in an explicit date-time range. Use check_availability only when the user provides date, time, duration, timezone, and working-hours context; otherwise ask for the missing details before checking. Calendar and availability answers must begin with 'Based on this dashboard...' and must not imply external calendar sync. For update_lead_fields, change_lead_status, and create_followup, always call preview mode first. Then call confirm_assistant_mutation with the preview. Only if the confirmation result is approved may you call apply mode with the returned previewId. If confirmation is denied, call reject_assistant_mutation with the previewId. Never apply a mutation without explicit user approval."
});

const copilotRuntime = new CopilotRuntime({
  agents: {
    default: assistant
  }
});

const handler = createCopilotRuntimeHandler({
  runtime: copilotRuntime,
  basePath: "/api/copilotkit",
  mode: "single-route"
});

export const POST = handler;
