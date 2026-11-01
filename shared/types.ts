/**
 * Type definitions for EventCraft.
 */

import { EVENT_TYPES, VENDOR_STATUSES } from "./constants.ts";

export type EventType = (typeof EVENT_TYPES)[number];
export type VendorStatus = (typeof VENDOR_STATUSES)[number];

export type BudgetStatus = "under" | "near" | "over";

export interface IntakeData {
  eventType: EventType;
  name: string;
  date: string; // YYYY-MM-DD
  guestCount: number;
  totalBudgetMinor: number;
  currency: string;
  city: string;
  priorities: string[];
  themeNotes: string;
  guestNeeds: string;
  culturalTraditions: string;
}

export interface BudgetCategoryItem {
  id: string;
  name: string;
  templatePercent: number;
  weight: number;
  plannedMinor: number;
  actualMinor: number;
  status: BudgetStatus;
  isPriority: boolean;
}

export interface BudgetPlan {
  totalPlannedMinor: number;
  totalActualMinor: number;
  remainingMinor: number;
  perGuestCostMinor: number;
  categories: BudgetCategoryItem[];
  currency: string;
  hasOverBudget: boolean;
}

export interface TimelineTask {
  id: string;
  title: string;
  category: string;
  dueDate: string; // YYYY-MM-DD
  daysBefore: number;
  essential: boolean;
  completed: boolean;
  isOverdue: boolean;
}

export interface TimelinePlan {
  tasks: TimelineTask[];
  isCompressed: boolean;
  compressionWarning?: string;
  overdueCount: number;
}

export interface VendorItem {
  id: string;
  name: string;
  category: string;
  status: VendorStatus;
  quoteMinor: number;
  notes: string;
  questionsToAsk: string[];
  redFlags: string[];
}

export interface PlanWarning {
  id: string;
  type: "budget" | "timeline" | "general";
  message: string;
}

export interface EventPlan {
  intake: IntakeData;
  budget: BudgetPlan;
  timeline: TimelinePlan;
  vendors: VendorItem[];
  warnings: PlanWarning[];
  lastUpdated: string;
}

export interface AiSourceBadge {
  source: "ai" | "fallback";
  label: "AI-generated" | "Template-based (AI unavailable)";
}

export interface VendorGuidanceResponse {
  category: string;
  questionsToAsk: string[];
  redFlags: string[];
  source: "ai" | "fallback";
}
