import React from "react";
import { MAX_PRIORITY_CATEGORIES } from "../../../shared/constants.ts";
import type { BudgetTemplateCategory } from "../../../shared/data/budgetTemplates.ts";

export interface Step3Props {
  categories: readonly BudgetTemplateCategory[];
  priorities: string[];
  onTogglePriority: (name: string) => void;
  themeNotes: string;
  setThemeNotes: (t: string) => void;
  guestNeeds: string;
  setGuestNeeds: (g: string) => void;
  culturalTraditions: string;
  setCulturalTraditions: (c: string) => void;
}

function getPriorityCardClass(isChecked: boolean, isLimitReached: boolean): string {
  if (isChecked) return "border-blue-800 bg-blue-50 text-blue-900";
  if (isLimitReached) return "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400";
  return "border-slate-300 bg-white text-slate-800 hover:bg-slate-50";
}

function PriorityCategorySelector({
  categories,
  priorities,
  onTogglePriority,
}: {
  categories: readonly BudgetTemplateCategory[];
  priorities: string[];
  onTogglePriority: (name: string) => void;
}): React.JSX.Element {
  return (
    <fieldset className="border-0 p-0">
      <legend className="block text-sm font-bold text-slate-900">
        Priority Categories (Choose up to 3 for budget weighting)
      </legend>
      <p className="mt-0.5 text-xs text-slate-600">
        Priority categories receive a 25% allocation boost without reducing contingency reserves.
      </p>
      <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {categories
          .filter((c) => !c.isContingency)
          .map((cat) => {
            const isChecked = priorities.includes(cat.name);
            const isLimitReached = !isChecked && priorities.length >= MAX_PRIORITY_CATEGORIES;

            return (
              <label
                key={cat.id}
                className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border p-2.5 text-xs font-medium sm:text-sm ${getPriorityCardClass(isChecked, isLimitReached)}`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isLimitReached}
                  onChange={() => onTogglePriority(cat.name)}
                  className="h-4 w-4 rounded-sm text-blue-800"
                />
                <span>{cat.name}</span>
              </label>
            );
          })}
      </div>
    </fieldset>
  );
}

/**
 * Step 3: Priority category selections, theme notes, guest needs, and traditions.
 */
export function Step3Details({
  categories,
  priorities,
  onTogglePriority,
  themeNotes,
  setThemeNotes,
  guestNeeds,
  setGuestNeeds,
  culturalTraditions,
  setCulturalTraditions,
}: Step3Props): React.JSX.Element {
  return (
    <div className="mt-4 space-y-5">
      <PriorityCategorySelector
        categories={categories}
        priorities={priorities}
        onTogglePriority={onTogglePriority}
      />

      <div>
        <label htmlFor="field-theme" className="block text-sm font-bold text-slate-900">
          Theme & Style Vision
        </label>
        <textarea
          id="field-theme"
          rows={2}
          value={themeNotes}
          onChange={(e) => setThemeNotes(e.target.value)}
          className="mt-1 block w-full rounded-md border border-slate-300 p-2.5 text-sm text-slate-900 shadow-xs focus-visible:outline-2"
          placeholder="e.g., Rustic botanical with warm string lights"
        />
      </div>

      <div>
        <label htmlFor="field-needs" className="block text-sm font-bold text-slate-900">
          Guest Dietary & Accessibility Needs
        </label>
        <textarea
          id="field-needs"
          rows={2}
          value={guestNeeds}
          onChange={(e) => setGuestNeeds(e.target.value)}
          className="mt-1 block w-full rounded-md border border-slate-300 p-2.5 text-sm text-slate-900 shadow-xs focus-visible:outline-2"
          placeholder="e.g., Gluten-free options, wheelchair access ramp"
        />
      </div>

      <div>
        <label htmlFor="field-traditions" className="block text-sm font-bold text-slate-900">
          Cultural Traditions & Ceremonies (Optional)
        </label>
        <textarea
          id="field-traditions"
          rows={2}
          value={culturalTraditions}
          onChange={(e) => setCulturalTraditions(e.target.value)}
          className="mt-1 block w-full rounded-md border border-slate-300 p-2.5 text-sm text-slate-900 shadow-xs focus-visible:outline-2"
          placeholder="e.g., Traditional tea ceremony, blessings, special dances"
        />
      </div>
    </div>
  );
}
