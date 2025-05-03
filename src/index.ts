// src/index.ts

import "dotenv/config";
import { healthcheck } from "./utils/healthcheck";
import { startBot } from "./bot";

/**
 * Application entry point.
 * - Runs the healthcheck HTTP server (for Container Apps).
 * - Bootstraps and starts the Discord bot.
 */

healthcheck();

(async () => {
  try {
    await startBot();
    console.log("Bot started successfully.");
  } catch (err) {
    console.error("Failed to start bot:", err);
    process.exit(1);
  }
})();
