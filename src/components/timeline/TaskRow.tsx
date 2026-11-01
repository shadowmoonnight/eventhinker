import React from "react";
import type { TimelineTask } from "../../../shared/types.ts";

export interface TaskRowProps {
  task: TimelineTask;
  onToggle: (taskId: string) => void;
}

function getTaskContainerClass(completed: boolean, isOverdue: boolean): string {
  if (completed) return "border-slate-200 bg-slate-50 opacity-80";
  if (isOverdue) return "border-red-300 bg-red-50/50";
  return "border-slate-300 bg-white hover:bg-slate-50";
}

function renderTaskBadge(completed: boolean, isOverdue: boolean): React.JSX.Element {
  if (completed) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-900">
        <span aria-hidden="true">✓</span>
        <span>Completed</span>
      </span>
    );
  }
  if (isOverdue) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2.5 py-1 text-xs font-bold text-red-900">
        <span aria-hidden="true">⚠</span>
        <span>Overdue</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
      Upcoming
    </span>
  );
}

/**
 * Memoized row component for an individual timeline task.
 */
export const TaskRow = React.memo(function TaskRow({
  task,
  onToggle,
}: TaskRowProps): React.JSX.Element {
  return (
    <div className={`flex items-start justify-between gap-4 rounded-lg border p-4 transition-colors ${getTaskContainerClass(task.completed, task.isOverdue)}`}>
      <div className="flex items-start gap-3.5">
        <label
          htmlFor={`task-check-${task.id}`}
          className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center pt-0.5"
        >
          <input
            id={`task-check-${task.id}`}
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            className="h-5 w-5 rounded-sm border-slate-400 text-blue-800 focus-visible:outline-2"
          />
          <span className="sr-only">Mark milestone "{task.title}" as completed</span>
        </label>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-sm font-bold ${task.completed ? "text-slate-500 line-through" : "text-slate-900"}`}>
              {task.title}
            </span>
            {task.essential ? (
              <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-800">
                Essential
              </span>
            ) : null}
            <span className="rounded border border-slate-300 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
              {task.category}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span>Due date: <strong className="text-slate-800">{task.dueDate}</strong></span>
            <span>({task.daysBefore} days before event)</span>
          </div>
        </div>
      </div>

      <div className="shrink-0 text-right">
        {renderTaskBadge(task.completed, task.isOverdue)}
      </div>
    </div>
  );
});
