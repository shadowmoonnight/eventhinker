/**
 * Template-based fallback ideas when AI is unavailable.
 */

import type { EventType } from "../types.ts";

export interface CategoryIdeaPack {
  theme: string;
  decor: string;
  menu: string;
  activities: string;
  favors: string;
  entertainment: string;
}

export const WEDDING_FALLBACK_IDEAS: CategoryIdeaPack = {
  theme: "Timeless Botanical Elegance with warm candlelight, linen textures, and olive branch accents.",
  decor: "Low-profile floral centerpieces, organic greenery runners, soft amber uplighting, and handwritten table numbers.",
  menu: "Seasonal farm-to-table plated dinner, artisanal bread baskets, signature his/hers botanical mocktails/cocktails, and a tiered naked sponge cake.",
  activities: "Interactive audio guestbook phone, personalized couple trivia at tables, and an evening sparkler farewell.",
  favors: "Mini jars of local artisanal honey or potted mini succulents with personalized thank-you tags.",
  entertainment: "Acoustic duo for ceremony and cocktail hour, transitioning to a high-energy live band or versatile DJ for reception.",
};

export const BIRTHDAY_FALLBACK_IDEAS: CategoryIdeaPack = {
  theme: "Modern Milestone Celebration with vibrant color pop palettes and neon statement signs.",
  decor: "Organic balloon arches, custom typography photo backdrops, metallic foil accents, and customized LED sign displays.",
  menu: "Interactive gourmet slider bar, loaded french fry station, specialty dessert shooters, and customized birthday confection.",
  activities: "Custom photo booth with instant polaroid prints, milestone highlight slideshow, and musical trivia rounds.",
  favors: "Custom cookies decorated to match the party palette and gourmet mini popcorn bags.",
  entertainment: "Dynamic DJ with customized decade-spanning playlist and ambient party lighting.",
};

export const COMMUNITY_FALLBACK_IDEAS: CategoryIdeaPack = {
  theme: "Neighborhood Unity & Green Gathering focusing on sustainability, local talent, and multigenerational connection.",
  decor: "Weather-resistant fabric bunting, bilingual directional wayfinding signs, and community-painted canvas welcome murals.",
  menu: "Rotational food truck village featuring diverse culinary traditions, hydration stations, and local bakery goods.",
  activities: "Interactive community puzzle/mural wall, lawn games (cornhole, giant Jenga), children's craft corner, and volunteer showcase.",
  favors: "Native wildflower seed packets and reusable canvas tote bags stamped with event logo.",
  entertainment: "Local youth orchestra, acoustic folk performers, cultural dance demonstrations, and open community mic.",
};

/**
 * Returns fallback ideas tailored by event type.
 * @param type - The event type.
 * @returns CategoryIdeaPack structure.
 */
export function getFallbackIdeas(type: EventType): CategoryIdeaPack {
  if (type === "wedding") {
    return WEDDING_FALLBACK_IDEAS;
  }
  if (type === "birthday") {
    return BIRTHDAY_FALLBACK_IDEAS;
  }
  return COMMUNITY_FALLBACK_IDEAS;
}
