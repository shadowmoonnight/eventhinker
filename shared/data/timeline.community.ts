/**
 * Community event timeline milestone template tasks (12 tasks, offsets 180 to 1 day).
 */

import type { TemplateTaskItem } from "./timeline.wedding.ts";

const CAT_VOLUNTEERS = "Volunteers & Safety";
const CAT_MARKETING = "Marketing & Outreach";
const CAT_EQUIPMENT = "Equipment (AV/Seating)";

export const COMMUNITY_TIMELINE_TASKS: readonly TemplateTaskItem[] = [
  { id: "c-permits", title: "Submit municipal permits, park reservations, and insurance", category: "Venue & Permits", daysBefore: 180, essential: true },
  { id: "c-committee", title: "Form planning committee and assign lead responsibilities", category: CAT_VOLUNTEERS, daysBefore: 150, essential: true },
  { id: "c-equipment", title: "Reserve stage, canopy tents, AV equipment, and portable restrooms", category: CAT_EQUIPMENT, daysBefore: 120, essential: true },
  { id: "c-sponsors", title: "Reach out to local community partners and sponsors", category: CAT_MARKETING, daysBefore: 90, essential: false },
  { id: "c-promo", title: "Launch flyer distribution, social media announcements, and press release", category: CAT_MARKETING, daysBefore: 60, essential: true },
  { id: "c-vendors", title: "Confirm community vendors, food trucks, and performer roster", category: "Program & Entertainment", daysBefore: 45, essential: true },
  { id: "c-volunteers", title: "Recruit volunteers and publish shift schedule", category: CAT_VOLUNTEERS, daysBefore: 30, essential: true },
  { id: "c-safety", title: "Review emergency action plan, first aid kit, and crowd flow", category: CAT_VOLUNTEERS, daysBefore: 20, essential: true },
  { id: "c-signage", title: "Print directional signs, schedule banners, and maps", category: CAT_MARKETING, daysBefore: 14, essential: false },
  { id: "c-briefing", title: "Host all-hands volunteer and team walk-through", category: CAT_VOLUNTEERS, daysBefore: 7, essential: true },
  { id: "c-loadin", title: "Oversee stage setup, sound check, and vendor load-in", category: CAT_EQUIPMENT, daysBefore: 1, essential: true },
  { id: "c-waste", title: "Stage trash/recycling receptacles and accessibility ramps", category: "Accessibility & Cleanup", daysBefore: 1, essential: true },
];
