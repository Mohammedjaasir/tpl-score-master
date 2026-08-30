import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Parses time-only strings (e.g., "13:30", "00:30", "18:00:00") or Date/ISO values
 * and converts them into standard 12-hour format: `h:mm AM/PM`.
 *
 * Examples:
 *   13:30 -> 1:30 PM
 *   18:00 -> 6:00 PM
 *   00:00 -> 12:00 AM
 *   00:30 -> 12:30 AM
 *   09:00 -> 9:00 AM
 *   12:00 -> 12:00 PM
 *   12:30 -> 12:30 PM
 *   23:59 -> 11:59 PM
 */
export function formatMatchTime(dateStr?: string | number | Date | null): string {
  if (!dateStr && dateStr !== 0) return "TBD";

  try {
    // 1. Check if string is a raw time format like "13:30" or "09:00:00"
    if (typeof dateStr === "string") {
      const timeMatch = dateStr.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
          const period = hours >= 12 ? "PM" : "AM";
          const h12 = hours % 12 === 0 ? 12 : hours % 12;
          const minStr = String(minutes).padStart(2, "0");
          return `${h12}:${minStr} ${period}`;
        }
      }
    }

    // 2. Parse as Date object / ISO string / Timestamp
    const d = dateStr instanceof Date ? dateStr : new Date(dateStr);
    if (isNaN(d.getTime())) return "TBD";

    const hours = d.getHours();
    const minutes = d.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 === 0 ? 12 : hours % 12;
    const minStr = String(minutes).padStart(2, "0");

    return `${h12}:${minStr} ${period}`;
  } catch {
    return "TBD";
  }
}

/**
 * Formats a date into `D MMM YYYY` (e.g., "15 Aug 2026").
 * Optionally supports relative format ("Today", "Tomorrow").
 */
export function formatMatchDate(
  dateStr?: string | number | Date | null,
  options?: { relative?: boolean },
): string {
  if (!dateStr && dateStr !== 0) return "Today";

  try {
    const d = dateStr instanceof Date ? dateStr : new Date(dateStr);
    if (isNaN(d.getTime())) return "Today";

    if (options?.relative) {
      const today = new Date();
      const isSameDay =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
      if (isSameDay) return "Today";

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const isTomorrow =
        d.getDate() === tomorrow.getDate() &&
        d.getMonth() === tomorrow.getMonth() &&
        d.getFullYear() === tomorrow.getFullYear();
      if (isTomorrow) return "Tomorrow";
    }

    const day = d.getDate();
    const month = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();

    return `${day} ${month} ${year}`;
  } catch {
    return "Today";
  }
}

/**
 * Formats full match date and time as:
 * `D MMM YYYY, h:mm AM/PM` (e.g., "15 Aug 2026, 1:30 PM")
 */
export function formatMatchDateTime(dateStr?: string | number | Date | null): string {
  if (!dateStr && dateStr !== 0) return "TBD";

  try {
    // If it's already a time-only string, just return formatted time
    if (typeof dateStr === "string" && /^\d{1,2}:\d{2}(?::\d{2})?$/.test(dateStr.trim())) {
      return formatMatchTime(dateStr);
    }

    const d = dateStr instanceof Date ? dateStr : new Date(dateStr);
    if (isNaN(d.getTime())) return "TBD";

    const day = d.getDate();
    const month = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    const time = formatMatchTime(d);

    return `${day} ${month} ${year}, ${time}`;
  } catch {
    return "TBD";
  }
}

/**
 * Formats delivery/ball event timestamps into 12-hour format with seconds:
 * `h:mm:ss AM/PM`
 */
export function formatDeliveryTimestamp(timestamp?: number | null): string {
  if (!timestamp) return "";
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return "";

    const hours = d.getHours();
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();
    const period = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 === 0 ? 12 : hours % 12;

    const minStr = String(minutes).padStart(2, "0");
    const secStr = String(seconds).padStart(2, "0");

    return `${h12}:${minStr}:${secStr} ${period}`;
  } catch {
    return "";
  }
}
