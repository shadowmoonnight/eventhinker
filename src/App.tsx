import React, { lazy, Suspense } from "react";
import { ErrorBoundary } from "./components/layout/ErrorBoundary.tsx";
import { Header } from "./components/layout/Header.tsx";
import { LiveRegion } from "./components/layout/LiveRegion.tsx";
import { Navigation } from "./components/layout/Navigation.tsx";
import { BudgetPlanner } from "./components/budget/BudgetPlanner.tsx";
import { TimelineView } from "./components/timeline/TimelineView.tsx";
import { VendorChecklist } from "./components/vendors/VendorChecklist.tsx";
import { IntakeWizard } from "./components/wizard/IntakeWizard.tsx";
import { PlanProvider, usePlanState } from "./state/PlanContext.tsx";

const PersonalizedIdeas = lazy(() => import("./components/ai/PersonalizedIdeas.tsx"));
const PlanningAssistant = lazy(() => import("./components/ai/PlanningAssistant.tsx"));
const PlanSummary = lazy(() => import("./components/ai/PlanSummary.tsx"));

function MainContent(): React.JSX.Element {
  const { activeSection } = usePlanState();

  return (
    <main id="main-content" className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6">
      {activeSection === "wizard" ? <IntakeWizard /> : null}
      {activeSection === "budget" ? <BudgetPlanner /> : null}
      {activeSection === "timeline" ? <TimelineView /> : null}
      {activeSection === "vendors" ? <VendorChecklist /> : null}

      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center text-sm font-semibold text-slate-700">
            Loading section...
          </div>
        }
      >
        {activeSection === "ideas" ? <PersonalizedIdeas /> : null}
        {activeSection === "assistant" ? <PlanningAssistant /> : null}
        {activeSection === "summary" ? <PlanSummary /> : null}
      </Suspense>
    </main>
  );
}

/**
 * EventCraft application root shell.
 */
export default function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <PlanProvider>
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <LiveRegion />
          <Header />
          <Navigation />
          <MainContent />
          <footer className="border-t border-slate-300 bg-white py-6 text-center text-xs text-slate-600 no-print">
            <div className="mx-auto max-w-7xl px-4">
              <p className="font-medium text-emerald-400">eventhinker — Celebration & Event Planner</p>
              <p className="mt-1">
                Deterministic Plan Engine with GenAI enrichment. All cost figures are guidelines and estimates, not formal quotes.
              </p>
            </div>
          </footer>
        </div>
      </PlanProvider>
    </ErrorBoundary>
  );
}
