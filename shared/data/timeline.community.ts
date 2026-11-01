/**
 * Community event timeline milestone template tasks (12 tasks, offsets 180 to 1 day).
 */

import type { TemplateTaskItem } from "./timeline.wedding.ts";

export const COMMUNITY_TIMELINE_TASKS: readonly TemplateTaskItem[] = [
  { id: "c-permits", title: "Submit municipal permits, park reservations, and insurance", category: "Venue & Permits", daysBefore: 180, essential: true },
  { id: "c-committee", title: "Form planning committee and assign lead responsibilities", category: "Volunteers & Safety", daysBefore: 150, essential: true },
  { id: "c-equipment", title: "Reserve stage, canopy tents, AV equipment, and portable restrooms", category: "Equipment (AV/Seating)", daysBefore: 120, essential: true },
  { id: "c-sponsors", title: "Reach out to local community partners and sponsors", category: "Marketing & Outreach", daysBefore: 90, essential: false },
  { id: "c-promo", title: "Launch flyer distribution, social media announcements, and press release", category: "Marketing & Outreach", daysBefore: 60, essential: true },
  { id: "c-vendors", title: "Confirm community vendors, food trucks, and performer roster", category: "Program & Entertainment", daysBefore: 45, essential: true },
  { id: "c-volunteers", title: "Recruit volunteers and publish shift schedule", category: "Volunteers & Safety", daysBefore: 30, essential: true },
  { id: "c-safety", title: "Review emergency action plan, first aid kit, and crowd flow", category: "Volunteers & Safety", daysBefore: 20, essential: true },
  { id: "c-signage", title: "Print directional signs, schedule banners, and maps", category: "Marketing & Outreach", daysBefore: 14, essential: false },
  { id: "c-briefing", title: "Host all-hands volunteer and team walk-through", category: "Volunteers & Safety", daysBefore: 7, essential: true },
  { id: "c-loadin", title: "Oversee stage setup, sound check, and vendor load-in", category: "Equipment (AV/Seating)", daysBefore: 1, essential: true },
  { id: "c-waste", title: "Stage trash/recycling receptacles and accessibility ramps", category: "Accessibility & Cleanup", daysBefore: 1, essential: true },
];
