import React from "react";
import { SourceBadge } from "./SourceBadge.tsx";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  source?: "ai" | "fallback";
  sourceLabel?: string;
}

export interface ChatMessageListProps {
  messages: ChatMessage[];
  streamingText: string;
  isStreaming: boolean;
  source: "ai" | "fallback";
  sourceLabel: string;
}

/**
 * Message log list for the Planning Assistant chat.
 */
export function ChatMessageList({
  messages,
  streamingText,
  isStreaming,
  source,
  sourceLabel,
}: ChatMessageListProps): React.JSX.Element {
  return (
    <div
      role="log"
      aria-live="polite"
      aria-busy={isStreaming}
      className="h-96 overflow-y-auto rounded-xl border border-slate-300 bg-white p-4 shadow-xs space-y-4"
    >
      {messages.length === 0 && !streamingText ? (
        <div className="flex h-full flex-col items-center justify-center text-center text-slate-600">
          <span aria-hidden="true" className="text-3xl">💬</span>
          <p className="mt-2 text-sm font-semibold text-slate-900">Your eventhinker Planning Advisor</p>
          <p className="text-xs">Ask anything about your schedule, guest needs, or vendor negotiations.</p>
        </div>
      ) : null}

      {messages.map((m) => (
        <div key={m.id} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
          <div
            className={`max-w-[85%] rounded-lg p-3.5 text-sm whitespace-pre-wrap leading-relaxed ${
              m.sender === "user"
                ? "bg-blue-800 text-white font-medium"
                : "bg-slate-100 text-slate-900 border border-slate-200"
            }`}
          >
            {m.text}
          </div>
        </div>
      ))}

      {streamingText ? (
        <div className="flex flex-col items-start space-y-1.5">
          <SourceBadge source={source} label={sourceLabel} />
          <div className="max-w-[85%] rounded-lg border border-slate-200 bg-slate-100 p-3.5 text-sm whitespace-pre-wrap leading-relaxed text-slate-900">
            {streamingText}
          </div>
        </div>
      ) : null}
    </div>
  );
}
