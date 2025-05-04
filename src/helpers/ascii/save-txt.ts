// === src/commands/save-txt.ts ===
import type {
  APIChatInputApplicationCommandInteraction,
  APIInteractionResponse,
  APIApplicationCommandInteractionDataSubcommandOption,
} from "discord-api-types/v10";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { convertText } from "../../services/ascii-converter";
import { DiscordAPIError, HTTPError } from "discord.js";

export async function handleSaveTxt(
  interaction: APIChatInputApplicationCommandInteraction,
  inputPath: string,
): Promise<APIInteractionResponse> {
  // Extract subcommand options
  const sub = (interaction.data.options ?? []).find(
    (o): o is APIApplicationCommandInteractionDataSubcommandOption =>
      o.type === ApplicationCommandOptionType.Subcommand && o.name === "txt",
  );
  const subOpts = sub?.options ?? [];

  // Build converter flags
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
      case "bg":
        flags.push("--color-bg", String(o.value));
        break;
    }
  }

  try {
    const ascii = await convertText(inputPath, { flags });
    return {
      type: 4,
      data: {
        content: `\`\`\`ansi
${ascii}
\`\`\``,
      },
    };
  } catch (err) {
    const Error = err as DiscordAPIError | HTTPError;
    console.error("Text conversion error:", Error);
    return { type: 4, data: { content: "❌ Text conversion failed." } };
  }
}
