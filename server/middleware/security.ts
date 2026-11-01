import type { NextFunction, Request, Response } from "express";

export const CSP_HEADER_VALUE =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data: https:; frame-ancestors 'self' https://*.google.com https://*.studio.google https://*.aistudio.google https://ai.studio https://*.run.app;";

/**
 * Security middleware applying headers and production CSP.
 * In dev, CSP is omitted to allow Vite dev server workflows.
 */
export function securityHeaders(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  if (process.env.NODE_ENV === "production") {
    res.setHeader("Content-Security-Policy", CSP_HEADER_VALUE);
  }

  next();
}
