import React, { useCallback, useMemo, useState } from "react";
import type { TimelineTask } from "../../../shared/types.ts";
import { usePlanDispatch, usePlanState } from "../../state/PlanContext.tsx";
import { CARD_EMPTY_CLASS, SECTION_HEADING_2XL, SECTION_HEADING_XL } from "../ui/styles.ts";
import { TaskRow } from "./TaskRow.tsx";
import { TimelineSummaryCards } from "./TimelineSummaryCards.tsx";

const TODAY_STR = new Date().toISOString().split("T")[0] ?? "2026-11-01";
type FilterMode = "all" | "incomplete" | "completed" | "overdue";

function TimelineAlerts({
  compressionWarning,
  overdueCount,
}: {
  compressionWarning: string | null;
  overdueCount: number;
}): React.JSX.Element {
  return (
    <div className="space-y-2">
      {compressionWarning ? (
        <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="text-xs font-semibold text-amber-900">{compressionWarning}</p>
        </div>
      ) : null}
      {overdueCount > 0 ? (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4">
          <p className="text-xs font-semibold text-red-900">
            You have {overdueCount} milestone{overdueCount > 1 ? "s" : ""} past their scheduled due date.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function TimelineFilterBar({
  filter,
  setFilter,
  shownCount,
  totalCount,
}: {
  filter: FilterMode;
  setFilter: (m: FilterMode) => void;
  shownCount: number;
  totalCount: number;
}): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
      <div className="flex items-center gap-2" role="group" aria-label="Filter milestones">
        {(["all", "incomplete", "completed", "overdue"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setFilter(mode)}
            className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md px-3 py-1.5 text-xs font-bold capitalize transition-colors focus-visible:outline-2 ${
              filter === mode ? "bg-blue-800 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
      <span className="text-xs font-medium text-slate-600">
        Showing {shownCount} of {totalCount} tasks
      </span>
    </div>
  );
}

function filterMilestones(tasks: readonly TimelineTask[], filter: FilterMode): readonly TimelineTask[] {
  if (filter === "completed") return tasks.filter((t) => t.completed);
  if (filter === "incomplete") return tasks.filter((t) => !t.completed);
  if (filter === "overdue") return tasks.filter((t) => t.isOverdue);
  return tasks;
}

function TimelineEmptyState(): React.JSX.Element {
  return (
    <div className={CARD_EMPTY_CLASS}>
      <h2 id="section-heading-timeline" tabIndex={-1} className={SECTION_HEADING_XL}>
        No Timeline Active
      </h2>
      <p className="mt-2 text-sm text-slate-700">Please complete the Intake Wizard to schedule your event timeline.</p>
    </div>
  );
}

function TimelineMilestonesList({
  tasks,
  onToggle,
}: {
  tasks: readonly TimelineTask[];
  onToggle: (taskId: string) => void;
}): React.JSX.Element {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} onToggle={onToggle} />
      ))}
    </div>
  );
}

/**
 * Timeline view presenting backward milestones, filter controls, and overdue alerts.
 */
export function TimelineView(): React.JSX.Element {
  const { plan } = usePlanState();
  const dispatch = usePlanDispatch();
  const [filter, setFilter] = useState<FilterMode>("all");

  const timeline = plan?.timeline;
  const handleToggle = useCallback(
    (taskId: string): void => dispatch({ type: "TOGGLE_TASK", payload: { taskId, today: TODAY_STR } }),
    [dispatch],
  );

  const filteredTasks = useMemo(() => {
    return timeline ? filterMilestones(timeline.tasks, filter) : [];
  }, [timeline, filter]);

  const completedCount = useMemo(() => {
    return timeline?.tasks.filter((t) => t.completed).length ?? 0;
  }, [timeline]);

  if (!plan || !timeline) {
    return <TimelineEmptyState />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 id="section-heading-timeline" tabIndex={-1} className={SECTION_HEADING_2XL}>
          Milestone Timeline
        </h2>
        <p className="text-sm text-slate-700">Backward-scheduled milestones targeted toward your event on {plan.intake.date}.</p>
      </div>

      <TimelineAlerts compressionWarning={timeline.compressionWarning ?? null} overdueCount={timeline.overdueCount} />

      <TimelineSummaryCards
        totalCount={timeline.tasks.length}
        completedCount={completedCount}
        overdueCount={timeline.overdueCount}
        targetDate={plan.intake.date}
      />

      <TimelineFilterBar
        filter={filter}
        setFilter={setFilter}
        shownCount={filteredTasks.length}
        totalCount={timeline.tasks.length}
      />

      <TimelineMilestonesList tasks={filteredTasks} onToggle={handleToggle} />
    </div>
  );
}
