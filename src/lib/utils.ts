import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ------------------------------------------------------------
// Prix & monnaie (F CFA / XOF, sans decimales)
// ------------------------------------------------------------
export function formatPrice(amount: number, currency = "XOF"): string {
  const formatted = new Intl.NumberFormat("fr-FR").format(Math.round(amount));
  if (currency === "XOF") return `${formatted} F CFA`;
  return `${formatted} ${currency}`;
}

export function formatPriceShort(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (amount >= 1000) {
    return `${Math.round(amount / 1000)}k`;
  }
  return String(amount);
}

// ------------------------------------------------------------
// Dates
// ------------------------------------------------------------
export function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function nightsBetween(start: Date | string, end: Date | string): number {
  const s = toDate(start);
  const e = toDate(end);
  const ms = e.getTime() - s.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function dateRangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  // Chevauchement strict : [aStart, aEnd) vs [bStart, bEnd)
  return aStart < bEnd && bStart < aEnd;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isPastDate(date: Date): boolean {
  return startOfDay(date) < startOfDay(new Date());
}

// Langue d'affichage des dates (FR par defaut ; les appels des pages
// bilingues passent la locale courante).
type DateLocale = "fr" | "en";

const MONTHS: Record<DateLocale, string[]> = {
  fr: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
const MONTHS_SHORT: Record<DateLocale, string[]> = {
  fr: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

export function formatDate(value: Date | string, locale: DateLocale = "fr"): string {
  const d = toDate(value);
  return `${d.getDate()} ${MONTHS[locale][d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateShort(value: Date | string, locale: DateLocale = "fr"): string {
  const d = toDate(value);
  return `${d.getDate()} ${MONTHS_SHORT[locale][d.getMonth()]}`;
}

export function formatDateRange(
  start: Date | string,
  end: Date | string,
  locale: DateLocale = "fr"
): string {
  const s = toDate(start);
  const e = toDate(end);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()} - ${e.getDate()} ${MONTHS_SHORT[locale][e.getMonth()]} ${e.getFullYear()}`;
  }
  return `${formatDateShort(s, locale)} - ${formatDateShort(e, locale)} ${e.getFullYear()}`;
}

export function relativeTime(value: Date | string, locale: DateLocale = "fr"): string {
  const d = toDate(value);
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  const en = locale === "en";
  if (mins < 1) return en ? "just now" : "à l'instant";
  if (mins < 60) return en ? `${mins} min ago` : `il y a ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return en ? `${hours} h ago` : `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return en ? `${days} d ago` : `il y a ${days} j`;
  return formatDate(d, locale);
}

// ------------------------------------------------------------
// Texte
// ------------------------------------------------------------
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function initials(firstName?: string | null, lastName?: string | null) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "...";
}

export function pluralize(count: number, singular: string, plural?: string) {
  return count <= 1 ? singular : plural ?? `${singular}s`;
}

// ------------------------------------------------------------
// JSON serialise (champs SQLite stockes en String)
// ------------------------------------------------------------
export function parseJsonArray(value?: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  }
}

export function stringifyArray(values: string[]): string {
  return JSON.stringify(values);
}

// ------------------------------------------------------------
// References lisibles
// ------------------------------------------------------------
export function generateReference(prefix = "KS"): string {
  const now = new Date();
  const y = String(now.getFullYear()).slice(2);
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${y}${String(now.getMonth() + 1).padStart(2, "0")}-${rand}`;
}
