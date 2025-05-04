// === src/commands/ascii.ts ===
import { SlashCommandBuilder } from "@discordjs/builders";
import type {
  APIChatInputApplicationCommandInteraction,
  APIInteractionResponse,
  APIApplicationCommandInteractionDataSubcommandOption,
} from "discord-api-types/v10";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { downloadImage } from "../utils/download";
import { handleSaveGif } from "../helpers/ascii/save-gif";
import { handleSaveImg } from "../helpers/ascii/save-img";
import { handleSaveTxt } from "../helpers/ascii/save-txt";

// Top-level /ascii command with three subcommands
export const data = new SlashCommandBuilder()
  .setName("ascii")
  .setDescription("Convert images to ASCII art: text, PNG, or GIF")
  .addSubcommand((sub) =>
    sub
      .setName("txt")
      .setDescription("ANSI/text output")
      .addStringOption((o) => o.setName("url").setDescription("Image URL"))
      .addAttachmentOption((o) =>
        o.setName("image").setDescription("Upload an image"),
      )
      .addIntegerOption((o) => o.setName("width").setDescription("Max width"))
      .addBooleanOption((o) =>
        o.setName("braille").setDescription("Use braille"),
      )
      .addBooleanOption((o) =>
        o.setName("dither").setDescription("Apply dithering"),
      )
      .addStringOption((o) =>
        o.setName("bg").setDescription("Background color"),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName("img")
      .setDescription("Generate a PNG of ASCII art")
      .addStringOption((o) => o.setName("url").setDescription("Image URL"))
      .addAttachmentOption((o) =>
        o.setName("image").setDescription("Upload an image"),
      )
      .addIntegerOption((o) => o.setName("width").setDescription("Max width"))
      .addBooleanOption((o) =>
        o.setName("braille").setDescription("Use braille"),
      )
      .addBooleanOption((o) =>
        o.setName("dither").setDescription("Apply dithering"),
      )
      .addBooleanOption((o) =>
        o.setName("color").setDescription("ANSI color palette"),
      )
      .addStringOption((o) =>
        o.setName("bg").setDescription("Background color"),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName("gif")
      .setDescription("Generate a GIF animation of ASCII art")
      .addStringOption((o) => o.setName("url").setDescription("Image URL"))
      .addAttachmentOption((o) =>
        o.setName("image").setDescription("Upload an image"),
      )
      .addIntegerOption((o) => o.setName("width").setDescription("Max width"))
      .addBooleanOption((o) =>
        o.setName("braille").setDescription("Use braille"),
      )
      .addBooleanOption((o) =>
        o.setName("dither").setDescription("Apply dithering"),
      )
      .addBooleanOption((o) =>
        o.setName("color").setDescription("ANSI color palette"),
      )
      .addStringOption((o) =>
        o.setName("bg").setDescription("Background color"),
      ),
  )
  .toJSON();

export async function executeHTTP(
  interaction: APIChatInputApplicationCommandInteraction,
): Promise<APIInteractionResponse> {
  // Find subcommand
  const sub = interaction.data.options?.find(
    (o): o is APIApplicationCommandInteractionDataSubcommandOption =>
      o.type === ApplicationCommandOptionType.Subcommand,
  );
  const subName = sub?.name;

  // Shared image resolution
  let imageUrl: string | undefined;
  if (interaction.data.resolved?.attachments) {
    const atts = Object.values(interaction.data.resolved.attachments);
    if (atts.length) imageUrl = atts[0].url;
  }
  if (!imageUrl) {
    const urlOpt = sub?.options?.find((o) => o.name === "url" && "value" in o);
    if (urlOpt) imageUrl = urlOpt.value as string;
  }
  if (!imageUrl) {
    return { type: 4, data: { content: "❌ No image provided." } };
  }

  // Download image once
  let inputPath: string;
  try {
    inputPath = await downloadImage(imageUrl);
  } catch (err) {
    console.error("Download failed:", err);
    return { type: 4, data: { content: "❌ Failed to download image." } };
  }

  // Delegate to specific handlers
  switch (subName) {
    case "txt":
      return handleSaveTxt(interaction, inputPath);
    case "img":
      return handleSaveImg(interaction, inputPath);
    case "gif":
      return handleSaveGif(interaction, inputPath);
    default:
      return { type: 4, data: { content: "❌ Unknown subcommand." } };
  }
}
