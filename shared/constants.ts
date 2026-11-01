/**
 * System-wide constants for EventCraft.
 */

export const PRIORITY_MULTIPLIER = 1.25;

export const MAX_PRIORITY_CATEGORIES = 3;

export const MIN_GUESTS = 1;
export const MAX_GUESTS = 5000;

export const MIN_BUDGET_MAJOR = 0;
export const MAX_BUDGET_MAJOR = 1_000_000_000;

export const MIN_BUDGET_MINOR = 0;
export const MAX_BUDGET_MINOR = 100_000_000_000; // 1 billion in minor cents

export const MAX_STRING_LENGTH = 500;
export const MAX_NOTES_LENGTH = 1000;

export const RATE_LIMIT_CAPACITY = 15;
export const RATE_LIMIT_REFILL_PER_MINUTE = 1;
export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_BUCKETS = 10_000;

export const AI_REQUEST_TIMEOUT_MS = 30_000;
export const STORAGE_DEBOUNCE_MS = 300;

export const EVENT_TYPES = ["wedding", "birthday", "community"] as const;

export const VENDOR_STATUSES = [
  "to-contact",
  "contacted",
  "quoted",
  "booked",
] as const;

export const BUDGET_STATUS_THRESHOLDS = {
  NEAR_RATIO: 0.9,
  OVER_RATIO: 1.0,
} as const;

export const DEFAULT_CURRENCY = "USD";
