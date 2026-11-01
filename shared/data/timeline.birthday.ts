/**
 * Birthday timeline milestone template tasks (11 tasks, offsets 90 to 1 day).
 */

import type { TemplateTaskItem } from "./timeline.wedding.ts";

export const BIRTHDAY_TIMELINE_TASKS: readonly TemplateTaskItem[] = [
  { id: "b-theme", title: "Decide on party theme, color scheme, and guest list", category: "Planning", daysBefore: 90, essential: true },
  { id: "b-venue", title: "Reserve party venue or prepare home space", category: "Venue", daysBefore: 75, essential: true },
  { id: "b-invites", title: "Send digital invitations and set RSVP deadline", category: "Invitations & Favors", daysBefore: 45, essential: true },
  { id: "b-entertain", title: "Book entertainer, DJ, or activity hosts", category: "Entertainment & Activities", daysBefore: 30, essential: false },
  { id: "b-cake", title: "Order custom birthday cake and specialty desserts", category: "Cake & Desserts", daysBefore: 21, essential: true },
  { id: "b-decor", title: "Purchase party supplies, balloons, and favors", category: "Decor & Balloons", daysBefore: 14, essential: false },
  { id: "b-menu", title: "Confirm food and beverage order and dietary needs", category: "Food & Drinks", daysBefore: 10, essential: true },
  { id: "b-playlist", title: "Build music playlist and test audio speakers", category: "Entertainment & Activities", daysBefore: 5, essential: false },
  { id: "b-groceries", title: "Pick up non-perishable drinks and ice coolers", category: "Food & Drinks", daysBefore: 2, essential: false },
  { id: "b-setup", title: "Decorate party room and set up activity stations", category: "Decor & Balloons", daysBefore: 1, essential: true },
  { id: "b-cake-pickup", title: "Pick up cake and chill beverages on party morning", category: "Cake & Desserts", daysBefore: 1, essential: true },
];
