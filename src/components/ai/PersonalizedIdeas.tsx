import React from "react";
import { useAiStream } from "../../hooks/useAiStream.ts";
import { usePlanState } from "../../state/PlanContext.tsx";
import { IdeasDisplay } from "./IdeasDisplay.tsx";
import { SourceBadge } from "./SourceBadge.tsx";

interface IdeasHeaderProps {
  eventName: string;
  hasText: boolean;
  source: "ai" | "fallback";
  sourceLabel: string;
  isStreaming: boolean;
  onStop: () => void;
  onGenerate: () => void;
}

function IdeasHeader({
  eventName,
  hasText,
  source,
  sourceLabel,
  isStreaming,
  onStop,
  onGenerate,
}: IdeasHeaderProps): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 id="section-heading-ideas" tabIndex={-1} className="text-2xl font-bold tracking-tight text-slate-900 outline-none">
          Personalized Event Ideas
        </h2>
        <p className="text-sm text-slate-700">
          Cohesive themes, decor, menu options, activities, and entertainment tailored to {eventName}.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {hasText ? <SourceBadge source={source} label={sourceLabel} /> : null}

        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-bold text-red-900 hover:bg-red-100 focus-visible:outline-2"
          >
            Stop Generation
          </button>
        ) : (
          <button
            type="button"
            onClick={onGenerate}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md bg-blue-800 px-5 py-2 text-sm font-bold text-white hover:bg-blue-900 focus-visible:outline-2"
          >
            {hasText ? "Regenerate Ideas" : "Generate Personalized Ideas"}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Personalized Ideas view streaming AI concepts or template fallback.
 */
export default function PersonalizedIdeas(): React.JSX.Element {
  const { plan } = usePlanState();
  const { text, isStreaming, source, sourceLabel, error, startStream, stopStream } = useAiStream();

  if (!plan) {
    return (
      <div className="rounded-xl border border-slate-300 bg-white p-8 text-center">
        <h2 id="section-heading-ideas" tabIndex={-1} className="text-xl font-bold text-slate-900 outline-none">
          No Event Plan Available
        </h2>
        <p className="mt-2 text-sm text-slate-700">Please complete the Intake Wizard to generate personalized ideas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <IdeasHeader
        eventName={plan.intake.name}
        hasText={Boolean(text)}
        source={source}
        sourceLabel={sourceLabel}
        isStreaming={isStreaming}
        onStop={stopStream}
        onGenerate={() => startStream("/api/ideas-stream", plan.intake)}
      />

      {error ? (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <IdeasDisplay text={text} isStreaming={isStreaming} eventType={plan.intake.eventType} />
    </div>
  );
}
