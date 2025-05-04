// === src/commands/save-gif.ts ===
import type {
  APIChatInputApplicationCommandInteraction,
  APIInteractionResponse,
  APIApplicationCommandInteractionDataSubcommandOption,
} from "discord-api-types/v10";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { convertGIF } from "../../services/ascii-converter";
import { DiscordAPIError, HTTPError, REST } from "discord.js";
import { Routes } from "discord-api-types/v10";

const tokenGif = process.env.DISCORD_BOT_TOKEN!;
const clientIdGif = process.env.DISCORD_CLIENT_ID!;
const restGif = new REST({ version: "10" }).setToken(tokenGif);

export async function handleSaveGif(
  interaction: APIChatInputApplicationCommandInteraction,
  inputPath: string,
): Promise<APIInteractionResponse> {
  const DEFER: APIInteractionResponse = { type: 5 };
  (async () => {
    try {
      const sub = (interaction.data.options ?? []).find(
        (o): o is APIApplicationCommandInteractionDataSubcommandOption =>
          o.type === ApplicationCommandOptionType.Subcommand &&
          o.name === "gif",
      );
      const subOpts = sub?.options ?? [];
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
      const buffer = await convertGIF(inputPath, { flags });
      await restGif.post(
        Routes.webhookMessage(clientIdGif, interaction.token),
        { body: { files: [{ attachment: buffer, name: "ascii-art.gif" }] } },
      );
    } catch (err) {
      const Error = err as DiscordAPIError | HTTPError;
      await restGif.post(
        Routes.webhookMessage(clientIdGif, interaction.token),
        { body: { content: `❌ GIF conversion failed: ${Error.message}` } },
      );
    }
  })();
  return DEFER;
}
