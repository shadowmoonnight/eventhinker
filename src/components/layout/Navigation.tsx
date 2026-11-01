import React, { useEffect } from "react";
import type { PlanState } from "../../state/planReducer.ts";
import { usePlanDispatch, usePlanState } from "../../state/PlanContext.tsx";

interface NavItem {
  id: PlanState["activeSection"];
  label: string;
  badge?: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { id: "wizard", label: "Intake Wizard" },
  { id: "budget", label: "Budget Planner" },
  { id: "timeline", label: "Timeline" },
  { id: "vendors", label: "Vendor Checklist" },
  { id: "ideas", label: "Ideas", badge: "AI" },
  { id: "assistant", label: "Assistant", badge: "AI" },
  { id: "summary", label: "Plan Summary", badge: "AI" },
];

function getNavButtonClass(isActive: boolean, isBlocked: boolean): string {
  if (isActive) return "bg-blue-800 text-white";
  if (isBlocked) return "cursor-not-allowed text-slate-400 opacity-60";
  return "text-slate-800 hover:bg-slate-100";
}

function getBadgeClass(isActive: boolean): string {
  if (isActive) return "bg-blue-950 text-blue-100";
  return "bg-slate-200 text-slate-700";
}

function NavButton({
  item,
  isActive,
  isBlocked,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  isBlocked: boolean;
  onClick: (id: PlanState["activeSection"]) => void;
}): React.JSX.Element {
  return (
    <li>
      <button
        type="button"
        disabled={isBlocked}
        aria-current={isActive ? "page" : undefined}
        onClick={() => onClick(item.id)}
        className={`inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 ${getNavButtonClass(isActive, isBlocked)}`}
      >
        <span>{item.label}</span>
        {item.badge ? (
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getBadgeClass(isActive)}`}>
            {item.badge}
          </span>
        ) : null}
      </button>
    </li>
  );
}

/**
 * Section navigation adhering strictly to WCAG 2.1 AA nav landmark rules.
 */
export function Navigation(): React.JSX.Element {
  const { activeSection, plan } = usePlanState();
  const dispatch = usePlanDispatch();

  useEffect(() => {
    const sectionTitle = activeSection.charAt(0).toUpperCase() + activeSection.slice(1);
    document.title = `eventhinker — ${sectionTitle}`;
  }, [activeSection]);

  const handleNavClick = (sectionId: PlanState["activeSection"]): void => {
    dispatch({ type: "SET_SECTION", payload: sectionId });
    setTimeout(() => {
      const heading = document.getElementById(`section-heading-${sectionId}`);
      heading?.focus();
    }, 50);
  };

  return (
    <nav aria-label="Plan sections" className="border-b border-slate-300 bg-white">
      <div className="mx-auto flex max-w-7xl overflow-x-auto px-4 py-2 sm:px-6">
        <ul className="flex flex-wrap items-center gap-1.5">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={activeSection === item.id}
              isBlocked={!plan && item.id !== "wizard"}
              onClick={handleNavClick}
            />
          ))}
        </ul>
      </div>
    </nav>
  );
}
