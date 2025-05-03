// === src/commands/save-img.ts ===
import type {
  APIChatInputApplicationCommandInteraction,
  APIInteractionResponse,
  APIApplicationCommandInteractionDataSubcommandOption,
} from "discord-api-types/v10";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { convertPNG } from "../services/ascii-converter";
import { REST, Routes } from "discord.js";

const token = process.env.DISCORD_BOT_TOKEN!;
const clientId = process.env.DISCORD_CLIENT_ID!;
const rest = new REST({ version: "10" }).setToken(token);

export async function handleSaveImg(
  interaction: APIChatInputApplicationCommandInteraction,
  inputPath: string,
): Promise<APIInteractionResponse> {
  // Defer the response immediately
  const DEFER: APIInteractionResponse = { type: 5 };

  (async () => {
    try {
      // Extract subcommand options for 'img'
      const sub = (interaction.data.options ?? []).find(
        (o): o is APIApplicationCommandInteractionDataSubcommandOption =>
          o.type === ApplicationCommandOptionType.Subcommand &&
          o.name === "img",
      );
      const subOpts = sub?.options ?? [];

      // Build CLI flags
      const flags: string[] = [];
      for (const o of subOpts) {
        if (!("value" in o)) continue;
        switch (o.name) {
          case "width":
            flags.push("--width", String(o.value));
            break;
          case "braille":
            if (o.value === true) flags.push("--braille");
            break;
          case "dither":
            if (o.value === true) flags.push("--dither");
            break;
          case "color":
            if (o.value === true) flags.push("--color");
            break;
          case "bg":
            flags.push("--save-bg", String(o.value));
            break;
        }
      }

      // Convert image to PNG buffer
      const buffer = await convertPNG(inputPath, { flags });

      // Send follow-up message with PNG attachment
      await rest.post(Routes.webhookMessage(clientId, interaction.token), {
        body: { files: [{ attachment: buffer, name: "ascii-art.png" }] },
      });
    } catch (err: any) {
      // Send follow-up on error
      await rest.post(Routes.webhookMessage(clientId, interaction.token), {
        body: { content: `❌ PNG conversion failed: ${err.message}` },
      });
    }
  })();

  return DEFER;
}
