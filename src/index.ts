// src/index.ts
import "dotenv/config";
import express from "express";
import { logger } from "./utils/logger"; // ← import logger

import { registerCommands } from "./bot";
import { healthRouter } from "./routes/health";
import { interactionsRouter } from "./routes/interactions";

async function main() {
  // 1) Register slash‑commands
  try {
    await registerCommands();
    logger.info("Discord commands registered"); // ← use logger
  } catch (err) {
    logger.error("Failed to register commands:", err); // ← use logger
    process.exit(1);
  }

  // 2) Spin up Express
  const app = express();
  const port = Number(process.env.PORT) || 8080;

  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/interactions", interactionsRouter);

  // Optional root
  app.get("/", (_req, res) => {
    res.status(200).send("OK");
    logger.debug("🌳 Root endpoint hit"); // ← use logger
  });

  app.listen(port, () => {
    logger.info(`HTTP server listening on port ${port}`); // ← use logger
  });
}

main();
