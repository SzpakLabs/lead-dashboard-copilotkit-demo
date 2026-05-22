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
  maxSteps: 4,
  prompt:
    "You are the lead operations dashboard assistant. Search and open only leads in the current dashboard. Use find_leads for search requests and open_lead when the user selects or clearly identifies a lead. Read-only answers should mention that results come from this dashboard."
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
