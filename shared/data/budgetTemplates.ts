/**
 * Budget category templates per event type.
 * All template percentages sum to exactly 100.
 */

import type { EventType } from "../types.ts";

export interface BudgetTemplateCategory {
  id: string;
  name: string;
  percent: number;
  isContingency?: boolean;
}

export const WEDDING_BUDGET_TEMPLATE: readonly BudgetTemplateCategory[] = [
  { id: "venue", name: "Venue", percent: 28 },
  { id: "catering_bar", name: "Catering & Bar", percent: 30 },
  { id: "photo_video", name: "Photography & Video", percent: 10 },
  { id: "attire_beauty", name: "Attire & Beauty", percent: 7 },
  { id: "decor_flowers", name: "Decor & Flowers", percent: 8 },
  { id: "music_entertainment", name: "Music & Entertainment", percent: 6 },
  { id: "stationery_invitations", name: "Stationery & Invitations", percent: 2 },
  { id: "transport_logistics", name: "Transport & Logistics", percent: 3 },
  { id: "officiant_ceremony", name: "Officiant & Ceremony", percent: 1 },
  { id: "contingency", name: "Contingency", percent: 5, isContingency: true },
];

export const BIRTHDAY_BUDGET_TEMPLATE: readonly BudgetTemplateCategory[] = [
  { id: "venue", name: "Venue", percent: 25 },
  { id: "food_drinks", name: "Food & Drinks", percent: 35 },
  { id: "cake_desserts", name: "Cake & Desserts", percent: 8 },
  { id: "decor_balloons", name: "Decor & Balloons", percent: 10 },
  { id: "entertainment_activities", name: "Entertainment & Activities", percent: 12 },
  { id: "invitations_favors", name: "Invitations & Favors", percent: 4 },
  { id: "photography", name: "Photography", percent: 2 },
  { id: "contingency", name: "Contingency", percent: 4, isContingency: true },
];

export const COMMUNITY_BUDGET_TEMPLATE: readonly BudgetTemplateCategory[] = [
  { id: "venue_permits", name: "Venue & Permits", percent: 20 },
  { id: "food_refreshments", name: "Food & Refreshments", percent: 25 },
  { id: "equipment_av_seating", name: "Equipment (AV/Seating)", percent: 15 },
  { id: "marketing_outreach", name: "Marketing & Outreach", percent: 10 },
  { id: "program_entertainment", name: "Program & Entertainment", percent: 12 },
  { id: "volunteers_safety", name: "Volunteers & Safety", percent: 8 },
  { id: "accessibility_cleanup", name: "Accessibility & Cleanup", percent: 5 },
  { id: "contingency", name: "Contingency", percent: 5, isContingency: true },
];

/**
 * Returns the budget template for an event type.
 * @param type - The event type.
 * @returns Array of budget template category items.
 */
export function getBudgetTemplate(type: EventType): readonly BudgetTemplateCategory[] {
  if (type === "wedding") {
    return WEDDING_BUDGET_TEMPLATE;
  }
  if (type === "birthday") {
    return BIRTHDAY_BUDGET_TEMPLATE;
  }
  return COMMUNITY_BUDGET_TEMPLATE;
}
