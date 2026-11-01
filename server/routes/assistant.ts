import { type Request, type Response, Router } from "express";
import { AI_REQUEST_TIMEOUT_MS, MAX_STRING_LENGTH } from "../../shared/constants.ts";
import { sanitizeStr } from "../../shared/sanitize.ts";
import type { EventPlan } from "../../shared/types.ts";
import type { AiClient } from "../ai/geminiClient.ts";
import { getFallbackAssistantResponse } from "../ai/fallbacks.ts";
import { BASE_SYSTEM_PROMPT, buildAssistantPrompt } from "../ai/prompts.ts";
import { initSseResponse, sendSseEvent, streamFallbackText } from "../ai/stream.ts";
import { sendError } from "../middleware/errors.ts";
import { aiRateLimiter } from "../middleware/rateLimit.ts";

function isValidPlanPayload(plan: unknown): plan is EventPlan {
  if (!plan || typeof plan !== "object") return false;
  const p = plan as Record<string, unknown>;
  return Boolean(p["intake"] && p["budget"] && p["timeline"] && Array.isArray(p["vendors"]));
}

export function createAssistantRouter(aiClient: AiClient): Router {
  const router = Router();

  router.post("/", aiRateLimiter, async (req: Request, res: Response) => {
    const rawMessage = req.body?.message;
    const message = sanitizeStr(rawMessage, MAX_STRING_LENGTH);
    if (!message) {
      sendError(res, 400, "Message is required and cannot be empty", "INVALID_MESSAGE");
      return;
    }

    const plan = req.body?.plan;
    if (!isValidPlanPayload(plan)) {
      sendError(res, 400, "Valid plan object is required", "INVALID_PLAN");
      return;
    }

    initSseResponse(res);

    if (!aiClient.isConfigured()) {
      await streamFallbackText(res, getFallbackAssistantResponse(message, plan));
      return;
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), AI_REQUEST_TIMEOUT_MS);
    req.on("close", () => abortController.abort());

    try {
      sendSseEvent(res, "metadata", { source: "ai", label: "AI-generated" });
      const prompt = buildAssistantPrompt(plan, message);
      const stream = aiClient.generateStream({
        prompt,
        systemInstruction: BASE_SYSTEM_PROMPT,
        signal: abortController.signal,
      });

      for await (const chunk of stream) {
        sendSseEvent(res, "chunk", chunk);
      }
      sendSseEvent(res, "done", "[DONE]");
      res.end();
    } catch {
      if (!res.writableEnded) {
        await streamFallbackText(res, getFallbackAssistantResponse(message, plan));
      }
    } finally {
      clearTimeout(timeout);
    }
  });

  return router;
}
