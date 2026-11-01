import React from "react";
import { usePlanState } from "../../state/PlanContext.tsx";

/**
 * Global aria-live region announcing transient status confirmations to screen readers.
 */
export function LiveRegion(): React.JSX.Element {
  const { notification } = usePlanState();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {notification ?? ""}
    </div>
  );
}
