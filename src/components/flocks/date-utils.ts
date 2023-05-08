export function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export function handleTimezone(date: Date) {
  const offset = date.getTimezoneOffset() * 60 * 1000;
  const adjustedDate = new Date(date.getTime() + offset);
  return adjustedDate;
}
