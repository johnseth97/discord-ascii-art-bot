// src/services/command-loader.ts
import fs from "fs";
import path from "path";
import type { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import type {
  APIInteraction,
  APIInteractionResponse,
} from "discord-api-types/v10";

// Matches modules exporting { data, executeHTTP }
export interface CommandModule {
  data: RESTPostAPIApplicationCommandsJSONBody;
  executeHTTP(interaction: APIInteraction): Promise<APIInteractionResponse>;
}

export function loadCommands(): CommandModule[] {
  const commandsPath = path.join(__dirname, "../commands");

  // Include both .ts and .js files, skip backups
  const files = fs
    .readdirSync(commandsPath)
    .filter(
      (f) => !f.endsWith(".bak") && (f.endsWith(".ts") || f.endsWith(".js")),
    );

  console.debug("loadCommands: found files", files);

  const commands: CommandModule[] = [];
  for (const file of files) {
    const filePath = path.join(commandsPath, file);
    // Dynamically require the module
    const mod = import(filePath) as Partial<CommandModule>;

    if (mod.data && typeof mod.executeHTTP === "function") {
      commands.push(mod as CommandModule);
    } else {
      console.warn(`Skipping invalid command file: ${file}`);
    }
  }

  return commands;
}
