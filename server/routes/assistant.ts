import { type Request, type Response, Router } from "express";
import { MAX_STRING_LENGTH } from "../../shared/constants.ts";
import { sanitizeStr } from "../../shared/sanitize.ts";
import type { AiClient } from "../ai/geminiClient.ts";
import { getFallbackAssistantResponse } from "../ai/fallbacks.ts";
import { buildAssistantPrompt } from "../ai/prompts.ts";
import { isValidPlanPayload, pipeAiStreamToSse } from "../ai/sse.ts";
import { sendError } from "../middleware/errors.ts";
import { aiRateLimiter } from "../middleware/rateLimit.ts";

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

    await pipeAiStreamToSse({
      req,
      res,
      aiClient,
      prompt: buildAssistantPrompt(plan, message),
      fallbackText: getFallbackAssistantResponse(message, plan),
    });
  });

  return router;
}
