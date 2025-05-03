import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Determine environment
const ENV = process.env.NODE_ENV || "development";
let clientId: string;
let guildId: string | undefined;
let botToken: string;

switch (ENV) {
  case "production":
    clientId = process.env.DISCORD_CLIENT_ID!;
    botToken = process.env.DISCORD_BOT_TOKEN!;
    // Global registration for production
    break;
  case "testing":
    clientId = process.env.DISCORD_CLIENT_ID_TESTING!;
    guildId = process.env.DISCORD_GUILD_ID_TESTING!;
    botToken = process.env.DISCORD_BOT_TOKEN_TESTING!;
    break;
  case "development":
  default:
    clientId = process.env.DISCORD_CLIENT_ID_DEVELOPMENT!;
    guildId = process.env.DISCORD_GUILD_ID_DEVELOPMENT!;
    botToken = process.env.DISCORD_BOT_TOKEN_DEVELOPMENT!;
}

// Load all command JSON
const commands: any[] = [];
const commandsPath = path.join(__dirname, "commands");
for (const file of fs.readdirSync(commandsPath)) {
  if (file.endsWith(".js") || file.endsWith(".ts")) {
    const command = require(path.join(commandsPath, file));
    if (command.data) {
      commands.push(command.data.toJSON());
    }
  }
}

const token = botToken;
const rest = new REST({ version: "10" }).setToken(token);

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
