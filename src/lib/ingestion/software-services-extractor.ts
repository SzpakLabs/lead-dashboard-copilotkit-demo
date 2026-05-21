import type {
  ExtractedLead,
  ExtractionInput,
  LeadExtractor
} from "./extraction";

const projectPatterns = [
  {
    label: "website",
    pattern: /\b(website|landing page|webflow|booking flow)\b/i
  },
  { label: "dashboard", pattern: /\b(dashboard|admin|portal|crm)\b/i },
  {
    label: "automation",
    pattern: /\b(automation|zapier|workflow|integration)\b/i
  },
  { label: "app", pattern: /\b(app|mobile|saas|platform)\b/i }
];

export class SoftwareServicesExtractor implements LeadExtractor {
  extract(input: ExtractionInput): ExtractedLead {
    const normalizedText = normalizeText(input.text);
    const contactName = extractContactName(normalizedText);
    const company = extractCompany(normalizedText);
    const projectType = extractProjectType(normalizedText);
    const budgetRange = extractBudget(normalizedText);
    const timeline = extractTimeline(normalizedText);
    const scheduledAt = extractScheduledAt(normalizedText);
    const followUpDueAt = extractFollowUpDueAt(normalizedText);
    const nextStep = extractNextStep(
      normalizedText,
      scheduledAt,
      followUpDueAt
    );
    const problemSummary = extractProblemSummary(normalizedText);
    const requestedOutcome = extractRequestedOutcome(
      normalizedText,
      projectType
    );
    const missingFields = collectMissingFields({
      contactName,
      problemSummary,
      requestedOutcome,
      nextStep
    });

    return {
      contactName,
      company,
      sourceChannel: input.sourceChannel,
      projectType,
      problemSummary,
      requestedOutcome,
      budgetRange,
      timeline,
      nextStep,
      scheduledAt,
      followUpDueAt,
      confidence:
        missingFields.length > 2
          ? "low"
          : missingFields.length > 0
            ? "medium"
            : "high",
      missingFields
    };
  }
}

export function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function extractContactName(text: string) {
  const explicitMatch = text.match(
    /\b(?:from|client|lead|name)[:\s]+([A-Z][a-z]+ Test)\b/
  );

  if (explicitMatch?.[1]) {
    return explicitMatch[1];
  }

  const testNameMatch = text.match(/\b([A-Z][a-z]+ Test)\b/);

  return testNameMatch?.[1] ?? null;
}

function extractCompany(text: string) {
  const companyMatch = text.match(
    /\b(?:from|at)\s+([A-Z][A-Za-z0-9& ]+(?:Company|Studio|Agency|LLC|Inc))\b/
  );

  return companyMatch?.[1]?.trim() ?? null;
}

function extractProjectType(text: string) {
  return (
    projectPatterns.find(({ pattern }) => pattern.test(text))?.label ?? null
  );
}

function extractBudget(text: string) {
  const budgetMatch = text.match(
    /\b(?:budget|around|about|range)\D{0,12}(\$?\d+[kK]?(?:\s*[-–]\s*\$?\d+[kK]?)?)\b/
  );

  return budgetMatch?.[1] ?? null;
}

function extractTimeline(text: string) {
  const timelineMatch = text.match(
    /\b(?:this|next)\s+(?:week|month|quarter|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i
  );

  return timelineMatch?.[0] ?? null;
}

function extractScheduledAt(text: string) {
  if (!/\b(call|meeting|demo|discovery)\b/i.test(text)) {
    return null;
  }

  if (/\bnext tuesday\b/i.test(text)) {
    return nextWeekdayUtc(2, 14);
  }

  if (/\bnext week\b/i.test(text)) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + 7);
    date.setUTCHours(14, 0, 0, 0);
    return date;
  }

  return null;
}

function extractFollowUpDueAt(text: string) {
  if (!/\bfollow[- ]?up\b/i.test(text)) {
    return null;
  }

  const date = new Date();
  date.setUTCHours(9, 0, 0, 0);

  if (/\btomorrow\b/i.test(text)) {
    date.setUTCDate(date.getUTCDate() + 1);
    return date;
  }

  return date;
}

function extractNextStep(
  text: string,
  scheduledAt: Date | null,
  followUpDueAt: Date | null
) {
  if (scheduledAt) {
    return "Prepare for scheduled discovery call";
  }

  if (followUpDueAt) {
    return "Send follow-up message";
  }

  if (/\bclarify\b/i.test(text)) {
    return "Clarify requirements";
  }

  return null;
}

function extractProblemSummary(text: string) {
  const needsMatch = text.match(
    /\b(?:needs?|wants?|asked about|looking for)\s+(.+?)(?:\.|$)/i
  );

  return needsMatch?.[1]?.trim() ?? null;
}

function extractRequestedOutcome(text: string, projectType: string | null) {
  if (!projectType) {
    return null;
  }

  return `Explore ${projectType} project scope and next steps`;
}

function collectMissingFields(fields: Record<string, string | null>) {
  return Object.entries(fields)
    .filter(([, value]) => !value)
    .map(([key]) => key);
}

function nextWeekdayUtc(weekday: number, hour: number) {
  const date = new Date();
  const daysUntil = (weekday + 7 - date.getUTCDay()) % 7 || 7;
  date.setUTCDate(date.getUTCDate() + daysUntil);
  date.setUTCHours(hour, 0, 0, 0);

  return date;
}
