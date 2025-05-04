// src/index.ts
import "dotenv/config";
import express from "express";
import { logger } from "./utils/logger"; // ← import logger
import { registerCommands } from "./bot";
import { healthRouter } from "./routes/health";
import { interactionsRouter } from "./routes/interactions";
import { discordVerify } from "./utils/discordVerify";
import { convertPNG } from "./services/ascii-converter";
import { downloadImage } from "./utils/download";

async function main() {
  // 0) Log required environment variables
  logger.info(`Node environment: ${process.env.NODE_ENV}`);

  // 1) Register slash‑commands
  try {
    await registerCommands();
    logger.info("Discord commands registered");
  } catch (err) {
    logger.error("Failed to register commands:", err);
    process.exit(1);
  }

  // 2) Spin up Express
  const app = express();
  const port = Number(process.env.PORT) || 8080;

  // 3) Use Express and parse verify from json body for discordVerify()
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        (req as any).rawBody = buf; // ← discordVerify() needs this
      },
    }),
  );
  // 4) Set up routes
  app.use("/health", healthRouter);
  app.use(
    "/interactions",
    discordVerify(), // ← verify Discord signatures(no-op in dev)
    interactionsRouter,
  );

  // Optional root
  app.get("/", (_req, res) => {
    res.status(200).send("OK");
    logger.debug("🌳 Root endpoint hit");
  });

  // 5) Start server
  app.listen(port, () => {
    logger.info(`HTTP server listening on port ${port}`);
  });
}

main();
