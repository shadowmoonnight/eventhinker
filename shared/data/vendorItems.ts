/**
 * Baseline vendor checklist items and category guidance.
 * Cost figures are estimates and guidelines, not quotes.
 */

import type { EventType, VendorItem } from "../types.ts";

export interface VendorSeedItem {
  id: string;
  name: string;
  category: string;
  questionsToAsk: string[];
  redFlags: string[];
}

export const WEDDING_VENDOR_SEEDS: readonly VendorSeedItem[] = [
  {
    id: "v-venue",
    name: "Ceremony & Reception Venue",
    category: "Venue",
    questionsToAsk: [
      "What is the exact curfew and noise restriction policy?",
      "Are outside caterers and alcohol permitted, or is there an in-house requirement?",
      "What is the bad-weather backup plan for outdoor spaces?",
    ],
    redFlags: [
      "Refusal to provide a written cancellation and refund policy",
      "Hidden service charges, cleanup fees, or mandatory security staffing fees",
    ],
  },
  {
    id: "v-caterer",
    name: "Catering & Bar Service",
    category: "Catering & Bar",
    questionsToAsk: [
      "Does pricing include tableware, linens, glassware, and staffing?",
      "How do you handle dietary restrictions, allergies, and vendor meals?",
    ],
    redFlags: [
      "No food safety license or commercial liability insurance",
      "Vague staffing ratios (fewer than 1 server per 25-30 guests)",
    ],
  },
  {
    id: "v-photo",
    name: "Lead Photographer & Videographer",
    category: "Photography & Video",
    questionsToAsk: [
      "What is the turnaround time for the full edited gallery?",
      "Who shoots the event if the primary photographer falls ill?",
    ],
    redFlags: [
      "Only showing curated 5-photo highlight reels rather than complete wedding galleries",
      "Contract does not specify raw footage rights or archival guarantees",
    ],
  },
  {
    id: "v-music",
    name: "DJ / Live Band",
    category: "Music & Entertainment",
    questionsToAsk: [
      "Do you provide wireless microphones for speeches and backup sound equipment?",
      "How do you handle 'do-not-play' lists and guest requests?",
    ],
    redFlags: [
      "No backup amplifiers or backup playback equipment on site",
      "Unwilling to coordinate timeline transitions with the caterer and planner",
    ],
  },
];

export const BIRTHDAY_VENDOR_SEEDS: readonly VendorSeedItem[] = [
  {
    id: "v-b-venue",
    name: "Party Hall / Space Rental",
    category: "Venue",
    questionsToAsk: [
      "How much setup and teardown buffer time is included in the rental window?",
      "Are open flames (birthday candles, sternos) permitted?",
    ],
    redFlags: ["No clear overtime rate listed in advance", "Unclear parking capacity"],
  },
  {
    id: "v-b-cake",
    name: "Custom Bakery / Cake Designer",
    category: "Cake & Desserts",
    questionsToAsk: [
      "Is delivery and display setup included or an extra charge?",
      "Can you accommodate severe nut or gluten allergies safely?",
    ],
    redFlags: ["Cannot provide temperature-controlled delivery", "No portfolio of recent custom work"],
  },
  {
    id: "v-b-entertain",
    name: "Entertainer / Performer / Activity Lead",
    category: "Entertainment & Activities",
    questionsToAsk: [
      "What age range is your show or activity best suited for?",
      "What specific power, staging, or space requirements do you need?",
    ],
    redFlags: ["Lacks background checks for children's entertainment", "Vague on performance duration"],
  },
];

export const COMMUNITY_VENDOR_SEEDS: readonly VendorSeedItem[] = [
  {
    id: "v-c-av",
    name: "Stage & AV Equipment Supplier",
    category: "Equipment (AV/Seating)",
    questionsToAsk: [
      "Is an on-site technician present throughout the event?",
      "Are all cables and power runs covered with ADA-compliant cable ramps?",
    ],
    redFlags: ["No weatherproof covers for outdoor electrical gear", "No generator backup"],
  },
  {
    id: "v-c-food",
    name: "Food Trucks & Refreshment Vendors",
    category: "Food & Refreshments",
    questionsToAsk: [
      "What electrical amperage or generator do you require?",
      "Do you carry municipal health permits and proof of liability insurance?",
    ],
    redFlags: ["Expired municipal permit", "Inability to maintain high-throughput service"],
  },
  {
    id: "v-c-sanitation",
    name: "Sanitation & Waste Management",
    category: "Accessibility & Cleanup",
    questionsToAsk: [
      "How frequently will portable restrooms and handwash stations be serviced?",
      "Do you supply marked recycling, compost, and landfill receptacles?",
    ],
    redFlags: ["No scheduled mid-event trash bin emptying", "Uncertain delivery window"],
  },
];

/**
 * Generates initial vendor checklist items for an event type.
 * @param type - The event type.
 * @returns Array of VendorItem objects.
 */
export function getInitialVendors(type: EventType): VendorItem[] {
  if (type === "wedding") {
    return WEDDING_VENDOR_SEEDS.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      status: "to-contact",
      quoteMinor: 0,
      notes: "",
      questionsToAsk: [...s.questionsToAsk],
      redFlags: [...s.redFlags],
    }));
  }
  const seeds = type === "birthday" ? BIRTHDAY_VENDOR_SEEDS : COMMUNITY_VENDOR_SEEDS;

  return seeds.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    status: "to-contact",
    quoteMinor: 0,
    notes: "",
    questionsToAsk: [...s.questionsToAsk],
    redFlags: [...s.redFlags],
  }));
}
