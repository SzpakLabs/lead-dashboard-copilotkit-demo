import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "dotenv";

const defaultAssistantModel = "openai/gpt-5.4-mini";
let localEnvironmentValues: Record<string, string | undefined> | null = null;

type AssistantRuntimeReadiness =
  | {
      enabled: true;
      model: string;
      apiKey: string;
      provider: string;
      providerKeyName: string;
    }
  | {
      enabled: false;
      model: string;
      provider: string;
      providerKeyName: string;
      reason: string;
    };

export function getAssistantRuntimeReadiness(): AssistantRuntimeReadiness {
  const model =
    getAssistantEnvironmentValue("COPILOTKIT_MODEL") || defaultAssistantModel;
  const provider = getModelProvider(model);
  const providerKeyName = getProviderKeyName(provider);
  const apiKey =
    getAssistantEnvironmentValue("COPILOTKIT_PROVIDER_API_KEY") ||
    getAssistantEnvironmentValue(providerKeyName);

  if (!isAssistantExplicitlyEnabled()) {
    return {
      enabled: false,
      model,
      provider,
      providerKeyName,
      reason: "Set LEAD_ASSISTANT_ENABLED=true to enable the demo assistant."
    };
  }

  if (!apiKey) {
    return {
      enabled: false,
      model,
      provider,
      providerKeyName,
      reason: `Set ${providerKeyName} or COPILOTKIT_PROVIDER_API_KEY to enable the demo assistant.`
    };
  }

  return {
    enabled: true,
    model,
    provider,
    providerKeyName,
    apiKey
  };
}

export function isAssistantRuntimeConfigured() {
  return getAssistantRuntimeReadiness().enabled;
}

function isAssistantExplicitlyEnabled() {
  const value = getAssistantEnvironmentValue(
    "LEAD_ASSISTANT_ENABLED"
  )?.toLowerCase();

  return value === "true" || value === "1";
}

function getAssistantEnvironmentValue(key: string) {
  return getLocalEnvironmentValue(key)?.trim() || process.env[key]?.trim();
}

function getLocalEnvironmentValue(key: string) {
  if (process.env.NODE_ENV === "production") {
    return undefined;
  }

  if (!localEnvironmentValues) {
    localEnvironmentValues = loadLocalEnvironmentValues();
  }

  return localEnvironmentValues[key];
}

function loadLocalEnvironmentValues() {
  const mode = process.env.NODE_ENV === "test" ? "test" : "development";
  const files = [
    `.env.${mode}.local`,
    mode !== "test" ? ".env.local" : null,
    `.env.${mode}`,
    ".env"
  ].filter((file): file is string => Boolean(file));
  const values: Record<string, string | undefined> = {};

  for (const file of files) {
    const path = join(process.cwd(), file);

    if (!existsSync(path)) {
      continue;
    }

    const parsed = parse(readFileSync(path));

    for (const [name, value] of Object.entries(parsed)) {
      if (values[name] === undefined) {
        values[name] = value;
      }
    }
  }

  return values;
}

function getModelProvider(model: string) {
  return model.split(/[/:]/)[0]?.toLowerCase() || "openai";
}

function getProviderKeyName(provider: string) {
  const providerKeyNames: Record<string, string> = {
    anthropic: "ANTHROPIC_API_KEY",
    gemini: "GOOGLE_GENERATIVE_AI_API_KEY",
    google: "GOOGLE_GENERATIVE_AI_API_KEY",
    openai: "OPENAI_API_KEY",
    vertex: "GOOGLE_VERTEX_API_KEY"
  };

  return providerKeyNames[provider] ?? "COPILOTKIT_PROVIDER_API_KEY";
}
