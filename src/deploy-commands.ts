// src/deploy-commands.ts
import "dotenv/config";
import { REST, Routes } from "discord.js";
import { loadCommands } from "./services/command-loader";

// Determine environment
const ENV = process.env.NODE_ENV ?? "development";
const clientId = process.env.DISCORD_CLIENT_ID!;
const guildId =
  ENV === "production" ? undefined : process.env.DISCORD_GUILD_ID!;

// Load all commands via our service
const commandModules = loadCommands();
const commands = commandModules.map((cmd) => cmd.data);

const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_BOT_TOKEN!,
);

(async () => {
  try {
    console.log(`Registering ${commands.length} commands for ${ENV}...`);
    if (ENV === "production") {
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log("Global commands registered.");
    } else {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId!), {
        body: commands,
      });
      console.log(`Commands registered to guild ${guildId}.`);
    }
  } catch (error) {
    console.error("Error registering commands:", error);
    process.exit(1);
  }
})();
