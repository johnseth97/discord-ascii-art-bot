// src/deploy-commands.ts
import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const commands = [];
const commandsPath = path.join(__dirname, "commands");
for (const file of fs.readdirSync(commandsPath)) {
  if (file.endsWith(".js") || file.endsWith(".ts")) {
    const command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_BOT_TOKEN!,
);

(async () => {
  try {
    console.log("Refreshing application (/) commands...");
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID!,
        process.env.DISCORD_GUILD_ID!,
      ),
      { body: commands },
    );
    console.log("Commands reloaded successfully.");
  } catch (error) {
    console.error("Error reloading commands:", error);
  }
})();
