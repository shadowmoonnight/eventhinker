import { type Request, type Response, Router } from "express";
import { AI_REQUEST_TIMEOUT_MS } from "../../shared/constants.ts";
import { validateIntakeData } from "../../shared/validation.ts";
import type { AiClient } from "../ai/geminiClient.ts";
import { getFallbackIdeasText } from "../ai/fallbacks.ts";
import { BASE_SYSTEM_PROMPT, buildIdeasPrompt } from "../ai/prompts.ts";
import { initSseResponse, sendSseEvent, streamFallbackText } from "../ai/stream.ts";
import { sendError } from "../middleware/errors.ts";
import { aiRateLimiter } from "../middleware/rateLimit.ts";

export function createIdeasRouter(aiClient: AiClient): Router {
  const router = Router();

  router.post("/", aiRateLimiter, async (req: Request, res: Response) => {
    const valid = validateIntakeData(req.body);
    if (!valid.ok) {
      sendError(res, 400, valid.error, "INVALID_INTAKE");
      return;
    }
    const intake = valid.value;

    initSseResponse(res);

    if (!aiClient.isConfigured()) {
      await streamFallbackText(res, getFallbackIdeasText(intake));
      return;
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), AI_REQUEST_TIMEOUT_MS);
    req.on("close", () => abortController.abort());

    try {
      sendSseEvent(res, "metadata", { source: "ai", label: "AI-generated" });
      const prompt = buildIdeasPrompt(intake);
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
        await streamFallbackText(res, getFallbackIdeasText(intake));
      }
    } finally {
      clearTimeout(timeout);
    }
  });

  return router;
}
