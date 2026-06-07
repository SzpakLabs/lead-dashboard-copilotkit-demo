import {
  BuiltInAgent,
  CopilotRuntime,
  createCopilotRuntimeHandler
} from "@copilotkit/runtime/v2";
import { NextResponse } from "next/server";
import { getAssistantRuntimeReadiness } from "@/lib/assistant/config";
import { assistantTools } from "@/lib/assistant/tools/leads";

export const runtime = "nodejs";

type CopilotHandler = (request: Request) => Response | Promise<Response>;

let handler: CopilotHandler | null = null;

export async function POST(request: Request) {
  const readiness = getAssistantRuntimeReadiness();

  if (!readiness.enabled) {
    return NextResponse.json(
      {
        error: "Assistant disabled",
        reason: readiness.reason,
        model: readiness.model,
        provider: readiness.provider,
        requiredEnv: readiness.providerKeyName
      },
      { status: 503 }
    );
  }

  return getHandler(readiness)(request);
}

function getHandler(
  readiness: Extract<
    ReturnType<typeof getAssistantRuntimeReadiness>,
    { enabled: true }
  >
) {
  if (handler) {
    return handler;
  }

  const assistant = new BuiltInAgent({
    model: readiness.model,
    apiKey: readiness.apiKey,
    tools: assistantTools,
    maxSteps: 8,
    prompt:
      "You are the lead operations dashboard assistant. Use provided route/page context to stay aware of the current page, selected lead, visible filters, calendar range, settings section, and lead detail hash. Search, open leads, list internal calendar items, generate reports, forecast near-period earnings, check availability, and draft lead mutations only in the current dashboard. Use find_leads for search requests and open_lead when the user selects or clearly identifies a lead. Use list_calendar_items for questions about what is scheduled in an explicit date-time range. Use get_lead_report for read-only reports over explicit periods such as this week, this month, last month, or custom dates. Use get_revenue_forecast for earning or pipeline estimates over explicit near periods. Use check_availability only when the user provides date, time, duration, timezone, and working-hours context; otherwise ask for the missing details before checking. Calendar, report, forecast, and availability answers must begin with 'Based on this dashboard...' and must not imply external calendar sync or accounting truth. For update_lead_fields, change_lead_status, and create_followup, always call preview mode first. Then call confirm_assistant_mutation with the preview. Only if the confirmation result is approved may you call apply mode with the returned previewId. If confirmation is denied, call reject_assistant_mutation with the previewId. Never apply a mutation without explicit user approval."
  });

  const copilotRuntime = new CopilotRuntime({
    agents: {
      default: assistant
    }
  });

  handler = createCopilotRuntimeHandler({
    runtime: copilotRuntime,
    basePath: "/api/copilotkit",
    mode: "single-route"
  });

  return handler;
}
