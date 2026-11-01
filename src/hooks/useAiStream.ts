/**
 * Hook for consuming SSE text streams with requestAnimationFrame batching and abort support.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface AiStreamState {
  text: string;
  isStreaming: boolean;
  source: "ai" | "fallback";
  sourceLabel: string;
  error: string | null;
}

export interface UseAiStreamReturn extends AiStreamState {
  startStream: (endpoint: string, payload: unknown) => Promise<void>;
  stopStream: () => void;
  resetStream: () => void;
}

interface FetchStreamParams {
  endpoint: string;
  payload: unknown;
  signal: AbortSignal;
  queueChunk: (c: string) => void;
  onMeta: (meta: { source?: "ai" | "fallback"; label?: string }) => void;
}

function parseSseLine(
  line: string,
  state: { currentEvent: string },
  onChunk: (chunk: string) => void,
  onMeta: (data: unknown) => void,
): void {
  if (line.startsWith("event: ")) {
    state.currentEvent = line.slice(7).trim();
  } else if (line.startsWith("data: ")) {
    const dataStr = line.slice(6);
    if (state.currentEvent === "metadata") {
      try {
        onMeta(JSON.parse(dataStr));
      } catch {
        // Ignore metadata parse error
      }
    } else if (state.currentEvent === "chunk") {
      onChunk(dataStr);
    }
  }
}

async function consumeStreamReader(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onChunk: (chunk: string) => void,
  onMeta: (meta: unknown) => void,
): Promise<void> {
  const decoder = new TextDecoder();
  let streamBuffer = "";
  const parseState = { currentEvent: "message" };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    streamBuffer += decoder.decode(value, { stream: true });
    const lines = streamBuffer.split("\n");
    streamBuffer = lines.pop() ?? "";

    for (const line of lines) {
      parseSseLine(line, parseState, onChunk, onMeta);
    }
  }
}

async function executeFetchStream(params: FetchStreamParams): Promise<void> {
  const res = await fetch(params.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params.payload),
    signal: params.signal,
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No body");
  await consumeStreamReader(reader, params.queueChunk, (m) => {
    params.onMeta(m as { source?: "ai" | "fallback"; label?: string });
  });
}

function useStreamBuffer(setText: React.Dispatch<React.SetStateAction<string>>) {
  const bufferRef = useRef<string>("");
  const rafIdRef = useRef<number | null>(null);

  const flushBuffer = useCallback((): void => {
    if (bufferRef.current) {
      setText((prev) => prev + bufferRef.current);
      bufferRef.current = "";
    }
    rafIdRef.current = null;
  }, [setText]);

  const queueChunk = useCallback((chunk: string): void => {
    bufferRef.current += chunk;
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(flushBuffer);
    }
  }, [flushBuffer]);

  const cancelBuffer = useCallback((): void => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      flushBuffer();
    }
  }, [flushBuffer]);

  return { queueChunk, flushBuffer, cancelBuffer };
}

/**
 * useAiStream hook: batches chunks using requestAnimationFrame, manages AbortController.
 */
export function useAiStream(): UseAiStreamReturn {
  const [text, setText] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [source, setSource] = useState<"ai" | "fallback">("ai");
  const [sourceLabel, setSourceLabel] = useState<string>("AI-generated");
  const [error, setError] = useState<string | null>(null);
  const abortCtrlRef = useRef<AbortController | null>(null);

  const { queueChunk, flushBuffer, cancelBuffer } = useStreamBuffer(setText);

  const stopStream = useCallback((): void => {
    abortCtrlRef.current?.abort();
    abortCtrlRef.current = null;
    cancelBuffer();
    setIsStreaming(false);
  }, [cancelBuffer]);

  const resetStream = useCallback((): void => {
    stopStream();
    setText("");
    setError(null);
    setSource("ai");
    setSourceLabel("AI-generated");
  }, [stopStream]);

  const startStream = useCallback(async (endpoint: string, payload: unknown): Promise<void> => {
    stopStream();
    setText("");
    setError(null);
    setIsStreaming(true);
    const controller = new AbortController();
    abortCtrlRef.current = controller;

    try {
      await executeFetchStream({
        endpoint,
        payload,
        signal: controller.signal,
        queueChunk,
        onMeta: (meta) => {
          if (meta.source) setSource(meta.source);
          if (meta.label) setSourceLabel(meta.label);
        },
      });
      flushBuffer();
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") setError("Failed to stream AI content.");
    } finally {
      setIsStreaming(false);
      abortCtrlRef.current = null;
    }
  }, [stopStream, queueChunk, flushBuffer]);

  useEffect(() => (): void => stopStream(), [stopStream]);

  return { text, isStreaming, source, sourceLabel, error, startStream, stopStream, resetStream };
}
