import { Router, Request, Response, NextFunction } from "express";
import { verifyKeyMiddleware } from "discord-interactions";
import type {
  APIInteraction,
  APIInteractionResponse,
} from "discord-api-types/v10";
import { loadCommands } from "../services/command-loader";
import { logger } from "../utils/logger"; // ← import your logger

const commands = loadCommands();
const verify = verifyKeyMiddleware(process.env.DISCORD_PUBLIC_KEY!) as any;

export const interactionsRouter = Router();

// —–––––
// DEV/TEST: log any GETs to /interactions
interactionsRouter.get("/", (req: Request, res: Response) => {
  logger.debug("📬 GET /interactions hit", {
    path: req.originalUrl,
    query: req.query,
    time: new Date().toISOString(),
  });
  // Respond to discord with 200 OK
  res.sendStatus(200);
});

// —–––––
// the existing POST handler
interactionsRouter.post(
  "/",
  verify,
  async (
    req: Request<{}, any, APIInteraction>,
    res: Response<any>,
    next: NextFunction,
  ) => {
    try {
      const interaction = req.body;
      logger.debug("🛰️ Received interaction", {
        type: interaction.type,
        command: interaction.type === 2 ? interaction.data.name : undefined,
      });

      if (interaction.type === 1) {
        res.json({ type: 1 });
        logger.debug("↩️ Replied to PING");
        return;
      }

      if (interaction.type === 2) {
        const cmd = commands.find((c) => c.data.name === interaction.data.name);
        if (!cmd) {
          res.json({ type: 4, data: { content: "❌ Command not found." } });
          logger.debug("❌ Command not found", { name: interaction.data.name });
          return;
        }

        const reply = await cmd.executeHTTP(interaction);
        res.json(reply);
        logger.debug("✅ Command executed", { name: interaction.data.name });
        return;
      }

      res.sendStatus(400);
      logger.debug("🚫 Unsupported interaction type", {
        type: interaction.type,
      });
    } catch (err) {
      logger.error("💥 Error in interaction handler", err);
      next(err);
    }
  },
);
