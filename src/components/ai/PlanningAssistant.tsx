import React, { useRef, useState } from "react";
import { useAiStream } from "../../hooks/useAiStream.ts";
import { usePlanState } from "../../state/PlanContext.tsx";
import { ChatMessageList, type ChatMessage } from "./ChatMessageList.tsx";

const QUICK_PROMPTS = [
  "What am I forgetting?",
  "Cut 10% from the budget",
  "Plan a rain backup",
];

function QuickPromptsBar({
  disabled,
  onSelect,
}: {
  disabled: boolean;
  onSelect: (p: string) => void;
}): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-slate-700">Quick inquiries:</span>
      {QUICK_PROMPTS.map((qp) => (
        <button
          key={qp}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(qp)}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-blue-800 bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-900 hover:bg-blue-100 focus-visible:outline-2 disabled:opacity-50"
        >
          {qp}
        </button>
      ))}
    </div>
  );
}

function AssistantInputForm({
  input,
  setInput,
  isStreaming,
  hasPlan,
  onSend,
  onStop,
}: {
  input: string;
  setInput: (v: string) => void;
  isStreaming: boolean;
  hasPlan: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}): React.JSX.Element {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSend(input);
      }}
      className="flex items-center gap-2"
    >
      <label htmlFor="assistant-input" className="sr-only">Ask planning assistant a question</label>
      <input
        id="assistant-input"
        type="text"
        value={input}
        disabled={isStreaming || !hasPlan}
        onChange={(e) => setInput(e.target.value)}
        placeholder={hasPlan ? "Ask a question about your plan..." : "Complete intake wizard first"}
        className="min-h-[44px] flex-1 rounded-md border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-2"
      />
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
          type="submit"
          disabled={!input.trim() || !hasPlan}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md bg-blue-800 px-5 py-2 text-sm font-bold text-white hover:bg-blue-900 focus-visible:outline-2 disabled:opacity-50"
        >
          Send
        </button>
      )}
    </form>
  );
}

/**
 * Planning Assistant component providing grounded Q&A with quick action prompts.
 */
export default function PlanningAssistant(): React.JSX.Element {
  const { plan } = usePlanState();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const messageCountRef = useRef<number>(0);

  const {
    text: streamingText,
    isStreaming,
    source,
    sourceLabel,
    error,
    startStream,
    stopStream,
  } = useAiStream();

  const handleSendPrompt = (promptText: string): void => {
    if (!plan || !promptText.trim() || isStreaming) return;
    messageCountRef.current += 1;
    const userMsg: ChatMessage = {
      id: `msg-${messageCountRef.current}`,
      sender: "user",
      text: promptText.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    startStream("/api/assistant-stream", { message: promptText.trim(), plan });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 id="section-heading-assistant" tabIndex={-1} className="text-2xl font-bold tracking-tight text-slate-900 outline-none">
          Planning Assistant
        </h2>
        <p className="text-sm text-slate-700">
          Ask questions grounded in your event plan, timeline deadlines, and budget allocations.
        </p>
      </div>

      <QuickPromptsBar disabled={isStreaming || !plan} onSelect={handleSendPrompt} />

      {error ? (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <ChatMessageList
        messages={messages}
        streamingText={streamingText}
        isStreaming={isStreaming}
        source={source}
        sourceLabel={sourceLabel}
      />

      <AssistantInputForm
        input={input}
        setInput={setInput}
        isStreaming={isStreaming}
        hasPlan={Boolean(plan)}
        onSend={handleSendPrompt}
        onStop={stopStream}
      />
    </div>
  );
}
