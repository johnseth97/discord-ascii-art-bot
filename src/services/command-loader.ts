// src/services/command-loader.ts
import fs from "fs";
import path from "path";
import type {
  APIInteraction,
  APIInteractionResponse,
} from "discord-api-types/v10";
import type { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";

/**
 * A single slash-command module interface.
 */
export interface CommandModule {
  data: RESTPostAPIApplicationCommandsJSONBody;
  executeHTTP(interaction: APIInteraction): Promise<APIInteractionResponse>;
}

/**
 * Recursively traverses the commands directory and loads every module that
 * exports a `data` builder and an `executeHTTP` handler.
 */
export function loadCommands(): CommandModule[] {
  const commandsDir = path.join(__dirname, "..", "commands");
  const modules: CommandModule[] = [];

  function traverse(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".js") || entry.name.endsWith(".ts"))
      ) {
        // Dynamically require each command file
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require(fullPath) as {
          data: { toJSON(): RESTPostAPIApplicationCommandsJSONBody };
          executeHTTP: (
            interaction: APIInteraction,
          ) => Promise<APIInteractionResponse>;
        };
        if (mod.data && typeof mod.executeHTTP === "function") {
          modules.push({
            data: mod.data.toJSON(),
            executeHTTP: mod.executeHTTP,
          });
        }
      }
    }
  }

  traverse(commandsDir);
  return modules;
}
