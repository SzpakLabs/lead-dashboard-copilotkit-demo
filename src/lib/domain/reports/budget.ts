export type ParsedBudget = {
  input: string | null;
  min: number | null;
  max: number | null;
  midpoint: number | null;
  label: string;
};

export function parseBudgetRange(input: string | null): ParsedBudget {
  const normalized = input?.trim() || null;

  if (!normalized) {
    return createUnknownBudget(null);
  }

  const matches = Array.from(
    normalized.matchAll(/(\d[\d,]*(?:\.\d+)?)\s*(k)?/gi)
  );

  if (matches.length === 0) {
    return createUnknownBudget(normalized);
  }

  const anyThousandsSuffix = matches.some((match) =>
    Boolean(match[2]?.toLowerCase())
  );
  const values = matches
    .map((match) => toBudgetNumber(match[1], match[2], anyThousandsSuffix))
    .filter((value): value is number => Number.isFinite(value));

  if (values.length === 0) {
    return createUnknownBudget(normalized);
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  return {
    input: normalized,
    min,
    max,
    midpoint: Math.round((min + max) / 2),
    label: normalized
  };
}

function createUnknownBudget(input: string | null): ParsedBudget {
  return {
    input,
    min: null,
    max: null,
    midpoint: null,
    label: input ?? "Unknown budget"
  };
}

function toBudgetNumber(
  rawValue: string,
  suffix: string | undefined,
  anyThousandsSuffix: boolean
) {
  const value = Number(rawValue.replace(/,/g, ""));
  const shouldUseThousands =
    Boolean(suffix?.toLowerCase()) || (anyThousandsSuffix && value < 1000);

  return shouldUseThousands ? value * 1000 : value;
}
