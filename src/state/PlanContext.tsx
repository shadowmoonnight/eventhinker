/**
 * Two-context split architecture: PlanStateContext and PlanDispatchContext.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { STORAGE_DEBOUNCE_MS } from "../../shared/constants.ts";
import { initialPlanState, planReducer, type PlanAction, type PlanState } from "./planReducer.ts";
import { loadSavedPlan, savePlan } from "./storage.ts";

const PlanStateContext = createContext<PlanState | null>(null);
const PlanDispatchContext = createContext<React.Dispatch<PlanAction> | null>(null);

export interface PlanProviderProps {
  children: ReactNode;
  initialState?: PlanState;
}

/**
 * PlanProvider initializes state from localStorage and persists changes with 300ms debounce.
 */
export function PlanProvider({ children, initialState }: PlanProviderProps): React.JSX.Element {
  const [state, dispatch] = useReducer(
    planReducer,
    initialState ?? {
      ...initialPlanState,
      plan: loadSavedPlan(),
      activeSection: loadSavedPlan() ? "budget" : "wizard",
    },
  );

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!state.plan) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (state.plan) {
        savePlan(state.plan);
      }
    }, STORAGE_DEBOUNCE_MS);

    return (): void => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state.plan]);

  return (
    <PlanStateContext.Provider value={state}>
      <PlanDispatchContext.Provider value={dispatch}>
        {children}
      </PlanDispatchContext.Provider>
    </PlanStateContext.Provider>
  );
}

/**
 * Hook to consume plan state.
 */
export function usePlanState(): PlanState {
  const context = useContext(PlanStateContext);
  if (!context) {
    throw new Error("usePlanState must be used within a PlanProvider");
  }
  return context;
}

/**
 * Hook to consume plan dispatch.
 */
export function usePlanDispatch(): React.Dispatch<PlanAction> {
  const context = useContext(PlanDispatchContext);
  if (!context) {
    throw new Error("usePlanDispatch must be used within a PlanProvider");
  }
  return context;
}
