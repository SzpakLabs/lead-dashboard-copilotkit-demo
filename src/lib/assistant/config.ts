const defaultAssistantModel = "openai/gpt-5.4-mini";

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
  const model = process.env.COPILOTKIT_MODEL?.trim() || defaultAssistantModel;
  const provider = getModelProvider(model);
  const providerKeyName = getProviderKeyName(provider);
  const apiKey =
    process.env[providerKeyName]?.trim() ||
    process.env.COPILOTKIT_PROVIDER_API_KEY?.trim();

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
  const value = process.env.LEAD_ASSISTANT_ENABLED?.trim().toLowerCase();

  return value === "true" || value === "1";
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
