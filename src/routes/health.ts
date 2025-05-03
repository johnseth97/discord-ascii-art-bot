// src/routes/health.ts
import { Router, Request, Response } from "express";
import { logger } from "../utils/logger";

export const healthRouter = Router();

healthRouter.get("/", (req: Request, res: Response) => {
  logger.debug("⏱️ Health‑check ping", {
    path: req.path,
    time: new Date().toISOString(),
  });
  res.status(200).send("OK");
});
