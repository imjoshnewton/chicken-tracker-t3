import { format, startOfDay, parseISO } from "date-fns";

export function formatDate(date: Date | string, formatStr: string = "MMM d, yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr);
}

export function formatShortDate(date: Date | string): string {
  return formatDate(date, "MMM d");
}

export function formatFullDate(date: Date | string): string {
  return formatDate(date, "MMMM d, yyyy");
}

export function getStartOfDay(date: Date = new Date()): Date {
  return startOfDay(date);
}

export function toISODateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
