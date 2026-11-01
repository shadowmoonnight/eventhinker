# EventCraft — Celebration & Event Planner

EventCraft is a GenAI-powered planning assistant that helps users organize weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas. Rather than isolated tools, EventCraft links every step of the event lifecycle into an interconnected Plan Engine where intake modifications automatically rebalance category allocations, adjust backward milestone timelines, and coordinate vendor vetting with contextual AI enrichment.

## The Plan Engine

At the heart of EventCraft is the Plan Engine: a deterministic, pure TypeScript pipeline (`intake → plan (budget + timeline + vendor checklist) → tracking`). Editing the intake parameters (dates, guest counts, budgets, or priority categories) immediately recalculates the plan while preserving user progress (milestone completions, actual spend, vendor statuses, and custom notes) by stable IDs. GenAI enriches the plan with tailored themes, contextual Q&A, and executive summaries, but the application remains completely functional and accurate even when AI services are unavailable.

## Features

| Feature | Brief Element | Primary File | Description |
| :--- | :--- | :--- | :--- |
| **1. Intake Wizard** | Event Types & Criteria | `src/components/wizard/IntakeWizard.tsx` | 3-step accessible form capturing event type (wedding, birthday, community), name, date, guests, budget, currency, city, priority weighting, and accessibility needs. |
| **2. Budget Planner** | Budgets & Tracking | `src/components/budget/BudgetPlanner.tsx` | Largest-remainder budget distribution with priority weighting, contingency protection, per-category actual spend inputs, progress bars, and over-budget warnings. |
| **3. Timeline** | Timelines & Deadlines | `src/components/timeline/TimelineView.tsx` | Backward-scheduled milestone dates calculated from event date, completion toggles, compression scaling, and overdue alerts. |
| **4. Vendor Checklist** | Vendor Checklists | `src/components/vendors/VendorChecklist.tsx` | Category-specific vendor pipeline (`to-contact`, `contacted`, `quoted`, `booked`), quote tracking, and AI-grounded vetting questions and red flags. |
| **5. Personalized Ideas** | Personalized Ideas | `src/components/ai/PersonalizedIdeas.tsx` | Streamed AI concepts spanning themes, decor, menus, activities, favors, and entertainment, with template-based fallback. |
| **6. Planning Assistant** | Planning Assistant | `src/components/ai/PlanningAssistant.tsx` | Conversational advisor grounded in current plan state, offering quick prompts ("What am I forgetting?", "Cut 10% from the budget", "Plan a rain backup"). |
| **7. Plan Summary** | Executive Summary | `src/components/ai/PlanSummary.tsx` | Streamed printable executive summary with dedicated print stylesheet and PDF export trigger. |

## Important Planning Note

All financial amounts and vendor quotes are planning guidelines and estimates entered by the user, not formal contracts or binding quotes. When external AI services are unreachable or unconfigured, EventCraft automatically serves deterministic template-based guidance with an explicit "Template-based (AI unavailable)" source badge.

## Setup & Running

```bash
# Install dependencies
npm install

# Start development server (serves frontend + backend on port 3000)
npm run dev

# Run linting and TypeScript checks
npm run lint

# Run typecheck only
npm run typecheck

# Run test suite
npm test

# Run test coverage
npm run test:coverage

# Build for production
npm run build

# Start production server
npm start
```
