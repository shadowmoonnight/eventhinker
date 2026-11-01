import { useEffect, type DependencyList } from "react";

/**
 * Executes an effect callback after a specified debounce delay.
 * @param effect - Callback to execute.
 * @param delayMs - Delay in milliseconds.
 * @param deps - Dependency list.
 */
export function useDebouncedEffect(
  effect: () => void | (() => void),
  delayMs: number,
  deps: DependencyList,
): void {
  useEffect(() => {
    const handler = setTimeout(() => {
      effect();
    }, delayMs);

    return (): void => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delayMs]);
}
