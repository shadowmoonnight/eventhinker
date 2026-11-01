import React from "react";

export interface TimelineSummaryCardsProps {
  totalCount: number;
  completedCount: number;
  overdueCount: number;
  targetDate: string;
}

/**
 * Summary cards presenting milestone progress counts.
 */
export function TimelineSummaryCards({
  totalCount,
  completedCount,
  overdueCount,
  targetDate,
}: TimelineSummaryCardsProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-xs">
        <p className="text-xs font-semibold text-slate-600">Total Milestones</p>
        <p className="mt-1 text-xl font-bold text-slate-900">{totalCount}</p>
      </div>
      <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-xs">
        <p className="text-xs font-semibold text-slate-600">Completed</p>
        <p className="mt-1 text-xl font-bold text-emerald-800">
          {completedCount} / {totalCount}
        </p>
      </div>
      <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-xs">
        <p className="text-xs font-semibold text-slate-600">Overdue Tasks</p>
        <p className={`mt-1 text-xl font-bold ${overdueCount > 0 ? "text-red-800" : "text-slate-900"}`}>
          {overdueCount}
        </p>
      </div>
      <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-xs">
        <p className="text-xs font-semibold text-slate-600">Target Date</p>
        <p className="mt-1 text-xl font-bold text-slate-900">{targetDate}</p>
      </div>
    </div>
  );
}
