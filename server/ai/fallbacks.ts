/**
 * Template-based deterministic fallbacks when AI is unavailable.
 */

import { getFallbackIdeas } from "../../shared/data/fallbackIdeas.ts";
import type { EventPlan, IntakeData } from "../../shared/types.ts";

/**
 * Returns formatted fallback ideas text.
 * @param intake - Intake parameters.
 * @returns Plain text formatted ideas.
 */
export function getFallbackIdeasText(intake: IntakeData): string {
  const ideas = getFallbackIdeas(intake.eventType);
  return (
    `Personalized Concepts for ${intake.name} (${intake.eventType.toUpperCase()}):\n\n` +
    `1. Theme & Color Palette:\n${ideas.theme}\n\n` +
    `2. Decor & Atmosphere:\n${ideas.decor}\n\n` +
    `3. Menu & Refreshments:\n${ideas.menu}\n\n` +
    `4. Interactive Activities:\n${ideas.activities}\n\n` +
    `5. Guest Favors & Takeaways:\n${ideas.favors}\n\n` +
    `6. Entertainment Program:\n${ideas.entertainment}`
  );
}

/**
 * Returns a grounded fallback response to common planner inquiries.
 * @param message - User's prompt.
 * @param plan - Current EventPlan.
 * @returns Plain text response.
 */
export function getFallbackAssistantResponse(message: string, plan: EventPlan): string {
  const lower = message.toLowerCase();
  if (lower.includes("forgetting") || lower.includes("missing")) {
    const overdue = plan.timeline.tasks.filter((t) => t.isOverdue);
    const unbooked = plan.vendors.filter((v) => v.status === "to-contact");
    return (
      `Based on your plan for ${plan.intake.name}:\n` +
      `- You have ${overdue.length} milestone(s) currently marked overdue.\n` +
      `- You have ${unbooked.length} vendor category/categories not yet contacted.\n` +
      `- Always remember to confirm day-of load-in parking and emergency first-aid contacts.`
    );
  }
  if (lower.includes("cut") || lower.includes("10%") || lower.includes("budget")) {
    return (
      `To trim approximately 10% from your ${plan.intake.currency} budget:\n` +
      `- Re-evaluate non-essential decor and paper stationery allocations.\n` +
      `- Opt for buffet or family-style service over plated multi-course catering.\n` +
      `- Review guest list size: at ${plan.intake.guestCount} guests, reducing 5-10 invitations yields immediate savings across food, bar, and rentals.`
    );
  }
  if (lower.includes("rain") || lower.includes("weather") || lower.includes("backup")) {
    return (
      `Rain and Inclement Weather Contingency Plan:\n` +
      `- Determine your 'weather call' deadline with venue/caterer 48-72 hours in advance.\n` +
      `- Ensure tent rentals include sidewalls and commercial water weight tie-downs.\n` +
      `- Stage covered walkway canopies and prepare designated coat/umbrella check areas.`
    );
  }
  return (
    `eventhinker Planning Advice for ${plan.intake.name}:\n` +
    `Your event is set for ${plan.intake.date} with ${plan.intake.guestCount} guests. ` +
    `Focus on securing your primary venue and catering contracts first, as those dictate your schedule and major spend.`
  );
}

/**
 * Returns a structured executive summary text.
 * @param plan - Current EventPlan.
 * @returns Formatted summary text.
 */
export function getFallbackSummaryText(plan: EventPlan): string {
  const booked = plan.vendors.filter((v) => v.status === "booked").length;
  const completedTasks = plan.timeline.tasks.filter((t) => t.completed).length;

  return (
    `EXECUTIVE EVENT PLAN SUMMARY: ${plan.intake.name.toUpperCase()}\n` +
    `======================================================\n\n` +
    `1. EVENT PROFILE\n` +
    `- Event Type: ${plan.intake.eventType}\n` +
    `- Scheduled Date: ${plan.intake.date}\n` +
    `- Target Guest Count: ${plan.intake.guestCount}\n` +
    `- City / Region: ${plan.intake.city || "Local"}\n\n` +
    `2. FINANCIAL OVERVIEW\n` +
    `- Total Planned Budget: ${(plan.budget.totalPlannedMinor / 100).toLocaleString()} ${plan.intake.currency}\n` +
    `- Actual Spend Committed: ${(plan.budget.totalActualMinor / 100).toLocaleString()} ${plan.intake.currency}\n` +
    `- Remaining Variance: ${(plan.budget.remainingMinor / 100).toLocaleString()} ${plan.intake.currency}\n` +
    `- Average Cost Per Guest: ${(plan.budget.perGuestCostMinor / 100).toLocaleString()} ${plan.intake.currency}\n\n` +
    `3. TIMELINE & MILESTONES\n` +
    `- Milestones Completed: ${completedTasks} of ${plan.timeline.tasks.length}\n` +
    `- Overdue Milestones: ${plan.timeline.overdueCount}\n` +
    `- Timeline Status: ${plan.timeline.isCompressed ? "Compressed" : "Standard"}\n\n` +
    `4. VENDOR LOGISTICS\n` +
    `- Booked Vendors: ${booked} of ${plan.vendors.length}\n\n` +
    `NOTE: Cost figures are guidelines and estimates, not formal quotes.`
  );
}

/**
 * Returns category vendor guidance questions and red flags.
 * @param category - Category name.
 * @returns Questions and red flags.
 */
export function getFallbackVendorGuidance(category: string): {
  questionsToAsk: string[];
  redFlags: string[];
} {
  return {
    questionsToAsk: [
      `What is included in the base package for ${category}?`,
      "What is your cancellation, reschedule, and refund policy in writing?",
      "Can you provide proof of commercial general liability insurance?",
    ],
    redFlags: [
      "Reluctance to put verbal promises into the written contract",
      "Demanding full payment upfront in cash without milestone deliverables",
    ],
  };
}
