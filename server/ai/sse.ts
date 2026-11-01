import type { Request, Response } from "express";
import { AI_REQUEST_TIMEOUT_MS } from "../../shared/constants.ts";
import type { EventPlan } from "../../shared/types.ts";
import type { AiClient } from "./geminiClient.ts";
import { BASE_SYSTEM_PROMPT } from "./prompts.ts";
import { initSseResponse, sendSseEvent, streamFallbackText } from "./stream.ts";

export interface SseStreamOptions {
  req: Request;
  res: Response;
  aiClient: AiClient;
  prompt: string;
  fallbackText: string;
  systemInstruction?: string;
}

/**
 * Validates that an incoming payload satisfies the minimal structure of an EventPlan.
 * @param plan - Unknown payload to validate.
 * @returns True if payload has intake, budget, timeline, and vendors.
 */
export function isValidPlanPayload(plan: unknown): plan is EventPlan {
  if (!plan || typeof plan !== "object") return false;
  const p = plan as Record<string, unknown>;
  return Boolean(p["intake"] && p["budget"] && p["timeline"] && Array.isArray(p["vendors"]));
}

/**
 * Pipes an AI streaming generation response directly to an SSE response with fallback on failure or timeout.
 * @param options - Configuration including Express req/res, AI client, prompts, and fallback text.
 */
export async function pipeAiStreamToSse(options: SseStreamOptions): Promise<void> {
  const { req, res, aiClient, prompt, fallbackText, systemInstruction = BASE_SYSTEM_PROMPT } = options;

  initSseResponse(res);

  if (!aiClient.isConfigured()) {
    await streamFallbackText(res, fallbackText);
    return;
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), AI_REQUEST_TIMEOUT_MS);
  req.on("close", () => abortController.abort());

  try {
    sendSseEvent(res, "metadata", { source: "ai", label: "AI-generated" });
    const stream = aiClient.generateStream({
      prompt,
      systemInstruction,
      signal: abortController.signal,
    });

    for await (const chunk of stream) {
      sendSseEvent(res, "chunk", chunk);
    }
    sendSseEvent(res, "done", "[DONE]");
    res.end();
  } catch {
    if (!res.writableEnded) {
      await streamFallbackText(res, fallbackText);
    }
  } finally {
    clearTimeout(timeout);
  }
}
