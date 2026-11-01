/**
 * Pure timeline calculations, backward milestone scheduling, and overdue detection.
 * All date math is strictly UTC date-only.
 */

import { BIRTHDAY_TIMELINE_TASKS } from "./data/timeline.birthday.ts";
import { COMMUNITY_TIMELINE_TASKS } from "./data/timeline.community.ts";
import {
  type TemplateTaskItem,
  WEDDING_TIMELINE_TASKS,
} from "./data/timeline.wedding.ts";
import type { EventType, TimelinePlan, TimelineTask } from "./types.ts";
import type { ValidationResult } from "./validation.ts";

/**
 * Parses YYYY-MM-DD into UTC epoch milliseconds.
 * @param dateStr - Date formatted as YYYY-MM-DD.
 * @returns Epoch milliseconds at UTC midnight.
 */
export function parseUtcMidnight(dateStr: string): number {
  const parts = dateStr.split("-").map((v) => parseInt(v, 10));
  const year = parts[0] ?? 1970;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  return Date.UTC(year, month - 1, day);
}

/**
 * Formats UTC epoch milliseconds as YYYY-MM-DD.
 * @param ms - Epoch milliseconds.
 * @returns Date string YYYY-MM-DD.
 */
export function formatUtcDate(ms: number): string {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Checks whether a task is overdue relative to an injected reference date.
 * @param task - The timeline task.
 * @param today - Current date string in YYYY-MM-DD.
 * @returns True if uncompleted and due date is strictly before today.
 */
export function isTaskOverdue(
  task: Pick<TimelineTask, "completed" | "dueDate">,
  today: string,
): boolean {
  return !task.completed && task.dueDate < today;
}

/**
 * Retrieves the timeline task template for an event type.
 * @param type - Event type.
 * @returns Array of template tasks.
 */
export function getTimelineTemplate(type: EventType): readonly TemplateTaskItem[] {
  if (type === "wedding") return WEDDING_TIMELINE_TASKS;
  if (type === "birthday") return BIRTHDAY_TIMELINE_TASKS;
  return COMMUNITY_TIMELINE_TASKS;
}

function computeTaskDays(daysBefore: number, leadDays: number, maxOffset: number): number {
  if (leadDays === 0) return 0;
  return Math.max(1, Math.round((daysBefore * leadDays) / maxOffset));
}

/**
 * Schedules milestone dates backward from event date with compression when needed.
 * @param eventDate - Target event date YYYY-MM-DD.
 * @param today - Reference date YYYY-MM-DD.
 * @param type - Event type.
 * @returns ValidationResult with complete TimelinePlan.
 */
interface TaskGenerationParams {
  template: readonly TemplateTaskItem[];
  isCompressed: boolean;
  leadDays: number;
  maxOffset: number;
  eventMs: number;
  today: string;
}

function buildTimelineTasks(params: TaskGenerationParams): TimelineTask[] {
  const { template, isCompressed, leadDays, maxOffset, eventMs, today } = params;
  return template.map((item) => {
    const daysBefore = isCompressed
      ? computeTaskDays(item.daysBefore, leadDays, maxOffset)
      : item.daysBefore;

    const dueMs = eventMs - daysBefore * 86_400_000;
    const dueDate = formatUtcDate(dueMs);
    const completed = false;

    return {
      id: item.id,
      title: item.title,
      category: item.category,
      dueDate,
      daysBefore,
      essential: item.essential,
      completed,
      isOverdue: isTaskOverdue({ completed, dueDate }, today),
    };
  });
}

/**
 * Builds backward timeline milestones for an event from target date.
 * @param eventDate - Target celebration date YYYY-MM-DD.
 * @param today - Current reference date YYYY-MM-DD.
 * @param type - Event type.
 * @returns ValidationResult with complete TimelinePlan.
 */
export function buildTimeline(
  eventDate: string,
  today: string,
  type: EventType,
): ValidationResult<TimelinePlan> {
  const eventMs = parseUtcMidnight(eventDate);
  const todayMs = parseUtcMidnight(today);
  const leadDays = Math.floor((eventMs - todayMs) / 86_400_000);

  if (leadDays < 0) {
    return { ok: false, error: "Event date cannot be in the past" };
  }

  const template = getTimelineTemplate(type);
  const maxOffset = Math.max(...template.map((t) => t.daysBefore), 1);
  const isCompressed = leadDays < maxOffset;

  const tasks = buildTimelineTasks({
    template,
    isCompressed,
    leadDays,
    maxOffset,
    eventMs,
    today,
  });

  const overdueCount = tasks.filter((t) => t.isOverdue).length;
  const compressionWarning = isCompressed
    ? `Compressed timeline: Planning window of ${leadDays} days is shorter than standard ${maxOffset} days. Milestones scaled accordingly.`
    : undefined;

  return {
    ok: true,
    value: {
      tasks,
      isCompressed,
      compressionWarning,
      overdueCount,
    },
  };
}
