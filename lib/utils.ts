import { VisitSource } from "@prisma/client";
import { format } from "date-fns";

export function normalizePhone(input: string | null | undefined): string | null {
  const digits = String(input ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }
  return digits;
}

export function isValidPhoneNumber(input: string | null | undefined): boolean {
  const digits = normalizePhone(input);
  return Boolean(digits && digits.length === 10);
}

export const PHONE_PATTERN = "^(?:\\+?1\\s*)?(?:\\([0-9]{3}\\)|[0-9]{3})[-.\\s]?[0-9]{3}[-.\\s]?[0-9]{4}$";

export function normalizeEmail(input: string | null | undefined): string | null {
  const email = String(input ?? "").trim().toLowerCase();
  return email ? email : null;
}

export function displayPhone(input: string | null | undefined): string {
  const digits = normalizePhone(input);
  if (!digits) return "No phone";
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return digits;
}

export function centsToCurrency(cents: number | null | undefined): string {
  const value = Number(cents ?? 0) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function dollarsToCents(input: string | FormDataEntryValue | null | undefined): number | null {
  const raw = String(input ?? "").trim();
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }
  return Math.round(value * 100);
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "Not scheduled";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return format(date, "MMM d, yyyy h:mm a");
}

export function visitSourceLabel(source: VisitSource): string {
  switch (source) {

    case VisitSource.STAFF:
      return "Staff";
    case VisitSource.IPAD:
    default:
      return "Client Intake";
  }
}

export function classNames(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
