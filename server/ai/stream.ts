import type { Response } from "express";

/**
 * Initializes Server-Sent Event headers on an Express response.
 * @param res - Express response object.
 */
export function initSseResponse(res: Response): void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
}

/**
 * Sends a single SSE event.
 * @param res - Express response.
 * @param event - Event name.
 * @param data - Raw text or serializable object.
 */
export function sendSseEvent(res: Response, event: string, data: unknown): void {
  const payload = typeof data === "string" ? data : JSON.stringify(data);
  res.write(`event: ${event}\ndata: ${payload}\n\n`);
}

/**
 * Streams a fallback plain text string via SSE chunks.
 * @param res - Express response.
 * @param text - Full fallback text.
 * @param chunkSize - Optional chunk length.
 */
export async function streamFallbackText(
  res: Response,
  text: string,
  chunkSize = 64,
): Promise<void> {
  sendSseEvent(res, "metadata", { source: "fallback", label: "Template-based (AI unavailable)" });

  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    sendSseEvent(res, "chunk", chunk);
  }

  sendSseEvent(res, "done", "[DONE]");
  res.end();
}
