// src/bot.ts

import express from "express";
import { REST, Routes } from "discord.js";
import { verifyKeyMiddleware } from "discord-interactions";
import fs from "fs";
import path from "path";
import type {
  APIInteraction,
  APIInteractionResponse,
} from "discord-api-types/v10";
import type { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";

import { loadCommands } from "./services/command-loader";

/**
 * Represents a command module loaded from disk.
 */
interface CommandModule {
  data: RESTPostAPIApplicationCommandsJSONBody;
  executeHTTP(interaction: APIInteraction): Promise<APIInteractionResponse>;
}

/**
 * Bootstraps HTTP interactions and registers commands with Discord.
 */
export async function startBot(): Promise<void> {
  // 1) Load command modules
  const commands = loadCommands() as CommandModule[];

  // 2) Register commands with Discord via REST
  const token = process.env.DISCORD_BOT_TOKEN!;
  const rest = new REST({ version: "10" }).setToken(token);
  const clientId = process.env.DISCORD_CLIENT_ID!;
  const guildId = process.env.DISCORD_GUILD_ID!;

  // (only register at runtime during development; CI/deploy handles prod)
  if (process.env.NODE_ENV !== "production") {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands.map((c) => c.data),
    });
    console.log(`Registered development guild commands for ${guildId}`);
  }

  // 3) Start HTTP server for interactions and health checks
  const app = express();
  app.use(express.json());

  // Verify Discord signature
  app.post(
    "/interactions",
    verifyKeyMiddleware(process.env.DISCORD_PUBLIC_KEY!),
    async (req, res) => {
      const interaction = req.body as APIInteraction;
      // Ping
      if (interaction.type === 1) return res.json({ type: 1 });
      // Slash command
      if (interaction.type === 2) {
        const name = interaction.data.name;
        const cmd = commands.find((c) => c.data.name === name);
        if (!cmd) {
          return res.json({
            type: 4,
            data: { content: "❌ Command not found." },
          });
        }
        try {
          const response = await cmd.executeHTTP(interaction);
          return res.json(response);
        } catch (err) {
          console.error(err);
          return res.json({
            type: 4,
            data: { content: "❌ Error executing command." },
          });
        }
      }
      // Unsupported
      res.sendStatus(400);
    },
  );

  // Express server handle root for healthcheck
  app.get("/", (_req, res) => {
    res.status(200).send("OK");
  });

  const port = Number(process.env.PORT) || 8080;
  await new Promise<void>((resolve) => {
    app.listen(port, () => {
      console.log(`HTTP server listening on port ${port}`);
      resolve();
    });
  });
}
