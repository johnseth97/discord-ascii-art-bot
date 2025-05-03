// src/utils/discordVerify.ts
import { verifyKeyMiddleware } from "discord-interactions";
import type { RequestHandler } from "express";

/**
 * In production, verify Discord signatures.
 * Otherwise (dev/testing), just skip straight to your handler.
 */
export function discordVerify(): RequestHandler {
  if (process.env.NODE_ENV === "production") {
    // cast because discord‑interactions exports its own types
    return verifyKeyMiddleware(
      process.env.DISCORD_PUBLIC_KEY!,
    ) as unknown as RequestHandler;
  }

  // no‑op
  return (_req, _res, next) => next();
}
