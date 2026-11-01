/**
 * Wedding timeline milestone template tasks (12 tasks, offsets 365 to 1 day).
 */

export interface TemplateTaskItem {
  id: string;
  title: string;
  category: string;
  daysBefore: number;
  essential: boolean;
}

export const WEDDING_TIMELINE_TASKS: readonly TemplateTaskItem[] = [
  { id: "w-venue", title: "Select and book wedding ceremony and reception venue", category: "Venue", daysBefore: 360, essential: true },
  { id: "w-photo", title: "Hire photographer and videographer", category: "Photography & Video", daysBefore: 300, essential: true },
  { id: "w-cater", title: "Finalize caterer, bar service, and sample menu", category: "Catering & Bar", daysBefore: 240, essential: true },
  { id: "w-attire", title: "Order wedding attire and schedule fittings", category: "Attire & Beauty", daysBefore: 210, essential: true },
  { id: "w-music", title: "Book DJ or live band and sound engineer", category: "Music & Entertainment", daysBefore: 180, essential: false },
  { id: "w-invites", title: "Design, print, and mail wedding invitations", category: "Stationery & Invitations", daysBefore: 120, essential: true },
  { id: "w-decor", title: "Finalize floral arrangements and decor installations", category: "Decor & Flowers", daysBefore: 90, essential: false },
  { id: "w-officiant", title: "Confirm ceremony script with officiant and legal paperwork", category: "Officiant & Ceremony", daysBefore: 60, essential: true },
  { id: "w-transport", title: "Arrange guest and wedding party transportation", category: "Transport & Logistics", daysBefore: 30, essential: false },
  { id: "w-final-count", title: "Submit final guest headcount to venue and caterer", category: "Catering & Bar", daysBefore: 14, essential: true },
  { id: "w-rehearsal", title: "Conduct rehearsal and distribute day-of itinerary", category: "Officiant & Ceremony", daysBefore: 2, essential: true },
  { id: "w-prep", title: "Pack emergency kit and steam ceremony garments", category: "Attire & Beauty", daysBefore: 1, essential: false },
];
