export const colors = {
  primary: "#385968",
  secondary: "#84A8A3",
  tertiary: "#CD7660",
  accent1: "#e76f51",
  accent2: "#e9c46a",
  background: "#FEF9F6",
  white: "#FFFFFF",
  black: "#000000",
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
} as const;

export const expenseCategories = [
  "Feed",
  "Supplements",
  "Healthcare",
  "Equipment",
  "Bedding",
  "Other",
] as const;

export type ExpenseCategory = (typeof expenseCategories)[number];

export const recurrenceOptions = [
  { label: "Never", value: "never" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
] as const;
