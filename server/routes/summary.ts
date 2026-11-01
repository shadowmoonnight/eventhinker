import { type Request, type Response, Router } from "express";
import type { AiClient } from "../ai/geminiClient.ts";
import { getFallbackSummaryText } from "../ai/fallbacks.ts";
import { buildSummaryPrompt } from "../ai/prompts.ts";
import { isValidPlanPayload, pipeAiStreamToSse } from "../ai/sse.ts";
import { sendError } from "../middleware/errors.ts";
import { aiRateLimiter } from "../middleware/rateLimit.ts";

export function createSummaryRouter(aiClient: AiClient): Router {
  const router = Router();

  router.post("/", aiRateLimiter, async (req: Request, res: Response) => {
    const plan = req.body?.plan;
    if (!isValidPlanPayload(plan)) {
      sendError(res, 400, "Valid plan object is required", "INVALID_PLAN");
      return;
    }

    await pipeAiStreamToSse({
      req,
      res,
      aiClient,
      prompt: buildSummaryPrompt(plan),
      fallbackText: getFallbackSummaryText(plan),
    });
  });

  return router;
}
