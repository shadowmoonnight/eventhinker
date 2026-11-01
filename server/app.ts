import express, { type Express } from "express";
import { defaultClient, type AiClient } from "./ai/geminiClient.ts";
import { globalErrorHandler } from "./middleware/errors.ts";
import { securityHeaders } from "./middleware/security.ts";
import { createAssistantRouter } from "./routes/assistant.ts";
import { createHealthRouter } from "./routes/health.ts";
import { createIdeasRouter } from "./routes/ideas.ts";
import { createSummaryRouter } from "./routes/summary.ts";
import { createVendorGuidanceRouter } from "./routes/vendorGuidance.ts";

export interface AppOptions {
  aiClient?: AiClient;
}

/**
 * Creates and configures the Express application with dependency-injected AI client.
 * @param options - Configuration options containing the AI client.
 * @returns Configured Express application instance.
 */
export function createApp(options: AppOptions = {}): Express {
  const app = express();
  const aiClient = options.aiClient ?? defaultClient;

  app.disable("x-powered-by");
  app.use(express.json({ limit: "20kb" }));
  app.use(securityHeaders);

  app.use("/api/health", createHealthRouter());
  app.use("/api/ideas-stream", createIdeasRouter(aiClient));
  app.use("/api/assistant-stream", createAssistantRouter(aiClient));
  app.use("/api/summary-stream", createSummaryRouter(aiClient));
  app.use("/api/vendor-guidance", createVendorGuidanceRouter(aiClient));

  app.use(globalErrorHandler);

  return app;
}
