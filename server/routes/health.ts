import { type Request, type Response, Router } from "express";

export function createHealthRouter(): Router {
  const router = Router();
  router.get("/", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
  return router;
}
