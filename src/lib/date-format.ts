const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC"
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC"
});

export function formatDateTime(value: Date | string | null) {
  return formatDateValue(value, dateTimeFormatter);
}

export function formatDate(value: Date | string | null) {
  return formatDateValue(value, dateFormatter);
}

function formatDateValue(
  value: Date | string | null,
  formatter: Intl.DateTimeFormat
) {
  if (!value) {
    return "Missing";
  }

  const date = typeof value === "string" ? new Date(value) : value;

  return formatter.format(date);
}
