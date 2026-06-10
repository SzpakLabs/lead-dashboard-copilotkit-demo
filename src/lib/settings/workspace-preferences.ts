import { z } from "zod";

export const workspacePreferencesStorageKey = "leadops.workspace.preferences";

const businessTypes = [
  "software-services",
  "laptop-repair",
  "beauty-studio",
  "general-service"
] as const;

const currencies = ["USD", "EUR", "GBP", "PLN"] as const;
const weekStarts = ["monday", "sunday"] as const;

export const workspacePreferencesSchema = z.object({
  workspaceName: z.string().trim().min(1).max(80),
  businessType: z.enum(businessTypes),
  timezone: z.string().trim().min(1).max(80),
  currency: z.enum(currencies),
  demoModeLabel: z.string().trim().min(1).max(60),
  workingHoursStart: z.string().regex(/^\d{2}:\d{2}$/),
  workingHoursEnd: z.string().regex(/^\d{2}:\d{2}$/),
  defaultFollowUpDays: z.number().int().min(1).max(30),
  reminderLeadHours: z.number().int().min(1).max(72),
  calendarWeekStartsOn: z.enum(weekStarts)
});

export type WorkspacePreferences = z.infer<typeof workspacePreferencesSchema>;

export const workspaceDefaults: WorkspacePreferences = {
  workspaceName: "Software Services Demo",
  businessType: "software-services",
  timezone: "Europe/Warsaw",
  currency: "USD",
  demoModeLabel: "Portfolio demo",
  workingHoursStart: "08:00",
  workingHoursEnd: "18:00",
  defaultFollowUpDays: 3,
  reminderLeadHours: 24,
  calendarWeekStartsOn: "monday"
};

export function readWorkspacePreferences(
  value: string | null
): WorkspacePreferences {
  if (!value) {
    return workspaceDefaults;
  }

  const parsed = safeParseJson(value);

  if (!parsed) {
    return workspaceDefaults;
  }

  const result = workspacePreferencesSchema.safeParse(parsed);

  return result.success ? result.data : workspaceDefaults;
}

export function serializeWorkspacePreferences(
  preferences: WorkspacePreferences
) {
  return JSON.stringify(workspacePreferencesSchema.parse(preferences));
}

function safeParseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}
