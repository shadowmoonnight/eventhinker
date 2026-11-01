import { type Request, type Response, Router } from "express";
import { EVENT_TYPES } from "../../shared/constants.ts";
import { sanitizeStr } from "../../shared/sanitize.ts";
import type { EventType, VendorGuidanceResponse } from "../../shared/types.ts";
import type { AiClient } from "../ai/geminiClient.ts";
import { getFallbackVendorGuidance } from "../ai/fallbacks.ts";
import { BASE_SYSTEM_PROMPT, buildVendorGuidancePrompt } from "../ai/prompts.ts";
import { sendError } from "../middleware/errors.ts";
import { aiRateLimiter } from "../middleware/rateLimit.ts";

function parseAiGuidanceJson(text: string): { questionsToAsk?: string[]; redFlags?: string[] } | null {
  try {
    const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchVendorGuidance(
  aiClient: AiClient,
  category: string,
  eventType: EventType,
): Promise<VendorGuidanceResponse> {
  const fallback = getFallbackVendorGuidance(category);
  if (!aiClient.isConfigured()) {
    return {
      category,
      questionsToAsk: fallback.questionsToAsk,
      redFlags: fallback.redFlags,
      source: "fallback",
    };
  }

  try {
    const prompt = buildVendorGuidancePrompt(category, eventType);
    const text = await aiClient.generateText({ prompt, systemInstruction: BASE_SYSTEM_PROMPT });
    const parsed = parseAiGuidanceJson(text);
    if (parsed && Array.isArray(parsed.questionsToAsk) && Array.isArray(parsed.redFlags)) {
      return {
        category,
        questionsToAsk: parsed.questionsToAsk.slice(0, 5),
        redFlags: parsed.redFlags.slice(0, 5),
        source: "ai",
      };
    }
  } catch {
    // Return fallback on failure
  }

  return {
    category,
    questionsToAsk: fallback.questionsToAsk,
    redFlags: fallback.redFlags,
    source: "fallback",
  };
}

export function createVendorGuidanceRouter(aiClient: AiClient): Router {
  const router = Router();

  router.post("/", aiRateLimiter, async (req: Request, res: Response) => {
    const category = sanitizeStr(req.body?.category, 100);
    const eventType = String(req.body?.eventType ?? "") as EventType;

    if (!category || !EVENT_TYPES.includes(eventType)) {
      sendError(res, 400, "Valid category and eventType are required", "INVALID_REQUEST");
      return;
    }

    const payload = await fetchVendorGuidance(aiClient, category, eventType);
    res.json(payload);
  });

  return router;
}
