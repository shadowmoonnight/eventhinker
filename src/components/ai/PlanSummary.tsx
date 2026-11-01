import React from "react";
import { useAiStream } from "../../hooks/useAiStream.ts";
import { usePlanState } from "../../state/PlanContext.tsx";
import { SourceBadge } from "./SourceBadge.tsx";
import { SummaryDisplay } from "./SummaryDisplay.tsx";

interface SummaryHeaderProps {
  hasText: boolean;
  source: "ai" | "fallback";
  sourceLabel: string;
  isStreaming: boolean;
  onStop: () => void;
  onGenerate: () => void;
  onPrint: () => void;
}

function SummaryHeader({
  hasText,
  source,
  sourceLabel,
  isStreaming,
  onStop,
  onGenerate,
  onPrint,
}: SummaryHeaderProps): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 no-print">
      <div>
        <h2 id="section-heading-summary" tabIndex={-1} className="text-2xl font-bold tracking-tight text-slate-900 outline-none">
          Executive Plan Summary
        </h2>
        <p className="text-sm text-slate-700">
          Comprehensive overview suitable for printing or sharing with co-hosts, vendors, and stakeholders.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {hasText ? <SourceBadge source={source} label={sourceLabel} /> : null}

        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-bold text-red-900 hover:bg-red-100 focus-visible:outline-2"
          >
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={onGenerate}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md bg-blue-800 px-5 py-2 text-sm font-bold text-white hover:bg-blue-900 focus-visible:outline-2"
          >
            {hasText ? "Regenerate Summary" : "Generate Executive Summary"}
          </button>
        )}

        {hasText ? (
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50 focus-visible:outline-2"
          >
            Print / Save PDF
          </button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Printable Plan Summary component providing executive overview and print stylesheet trigger.
 */
export default function PlanSummary(): React.JSX.Element {
  const { plan } = usePlanState();
  const { text, isStreaming, source, sourceLabel, error, startStream, stopStream } = useAiStream();

  if (!plan) {
    return (
      <div className="rounded-xl border border-slate-300 bg-white p-8 text-center">
        <h2 id="section-heading-summary" tabIndex={-1} className="text-xl font-bold text-slate-900 outline-none">
          No Plan Available to Summarize
        </h2>
        <p className="mt-2 text-sm text-slate-700">Please complete the Intake Wizard to generate an executive plan summary.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SummaryHeader
        hasText={Boolean(text)}
        source={source}
        sourceLabel={sourceLabel}
        isStreaming={isStreaming}
        onStop={stopStream}
        onGenerate={() => startStream("/api/summary-stream", { plan })}
        onPrint={() => window.print()}
      />

      {error ? (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800 no-print">
          {error}
        </div>
      ) : null}

      <SummaryDisplay text={text} isStreaming={isStreaming} eventName={plan.intake.name} />
    </div>
  );
}
