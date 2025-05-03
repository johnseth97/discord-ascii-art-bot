// src/bot.ts

import { REST, Routes } from "discord.js";
import type { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { loadCommands } from "./services/command-loader";

/**
 * Registers your slash commands with Discord via REST.
 */
export async function registerCommands(): Promise<void> {
  const token = process.env.DISCORD_BOT_TOKEN!;
  const clientId = process.env.DISCORD_CLIENT_ID!;
  const guildId = process.env.DISCORD_GUILD_ID!;

  const rest = new REST({ version: "10" }).setToken(token);
  const commands = loadCommands() as {
    data: RESTPostAPIApplicationCommandsJSONBody;
  }[];
  const body = commands.map((c) => c.data);

  if (process.env.NODE_ENV !== "production") {
    // Register guild commands in development for rapid iteration
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body,
    });
    console.log(`✔ Registered development guild commands for ${guildId}`);
  } else {
    // Register global commands (might take up to an hour to propagate)
    await rest.put(Routes.applicationCommands(clientId), { body });
    console.log("✔ Registered global commands");
  }
}
