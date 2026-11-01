import { type Request, type Response, Router } from "express";
import { validateIntakeData } from "../../shared/validation.ts";
import type { AiClient } from "../ai/geminiClient.ts";
import { getFallbackIdeasText } from "../ai/fallbacks.ts";
import { buildIdeasPrompt } from "../ai/prompts.ts";
import { pipeAiStreamToSse } from "../ai/sse.ts";
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

    await pipeAiStreamToSse({
      req,
      res,
      aiClient,
      prompt: buildIdeasPrompt(intake),
      fallbackText: getFallbackIdeasText(intake),
    });
  });

  return router;
}
