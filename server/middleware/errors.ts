import type { NextFunction, Request, Response } from "express";

export interface ApiErrorPayload {
  error: string;
  code: string;
}

/**
 * Sends a structured, uniform JSON error response without internal details.
 */
export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  code: string,
): void {
  res.status(statusCode).json({
    error: message,
    code,
  });
}

/**
 * Global fallback error handler for unexpected server errors.
 */
export function globalErrorHandler(
  _err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (res.headersSent) return;
  sendError(
    res,
    500,
    "An unexpected internal error occurred. Please try again.",
    "INTERNAL_ERROR",
  );
}
