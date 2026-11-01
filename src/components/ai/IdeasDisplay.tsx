import React from "react";

export interface IdeasDisplayProps {
  text: string;
  isStreaming: boolean;
  eventType: string;
}

/**
 * Display container for streamed personalized event ideas.
 */
export function IdeasDisplay({
  text,
  isStreaming,
  eventType,
}: IdeasDisplayProps): React.JSX.Element {
  return (
    <div
      role="log"
      aria-live="polite"
      aria-busy={isStreaming}
      className="min-h-[300px] rounded-xl border border-slate-300 bg-white p-6 shadow-xs whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-900"
    >
      {text ? (
        text
      ) : (
        <div className="flex h-64 flex-col items-center justify-center text-center text-slate-600">
          <span aria-hidden="true" className="text-4xl">💡</span>
          <p className="mt-3 font-semibold text-slate-900">Explore creative concepts for your {eventType}</p>
          <p className="mt-1 text-xs">Click "Generate Personalized Ideas" to stream tailored themes, decor, menu, and activities.</p>
        </div>
      )}
    </div>
  );
}
