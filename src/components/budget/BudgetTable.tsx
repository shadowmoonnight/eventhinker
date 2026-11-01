import React from "react";
import type { BudgetCategoryItem } from "../../../shared/types.ts";
import { BudgetRow } from "./BudgetRow.tsx";

export interface BudgetTableProps {
  categories: readonly BudgetCategoryItem[];
  currency: string;
  onActualChange: (categoryId: string, actualMinor: number) => void;
}

export function BudgetTable({
  categories,
  currency,
  onActualChange,
}: BudgetTableProps): React.JSX.Element {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-xs">
      <table className="min-w-full divide-y divide-slate-200 text-left">
        <caption className="sr-only">Budget Category Allocations and Actual Spend Tracking</caption>
        <thead className="bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-700">
          <tr>
            <th scope="col" className="px-4 py-3">Category</th>
            <th scope="col" className="px-4 py-3">Planned</th>
            <th scope="col" className="px-4 py-3">Actual Spend</th>
            <th scope="col" className="px-4 py-3">Spend Progress</th>
            <th scope="col" className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {categories.map((category) => (
            <BudgetRow
              key={category.id}
              category={category}
              currency={currency}
              onActualChange={onActualChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
