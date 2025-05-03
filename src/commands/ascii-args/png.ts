// png.ts
import { SlashCommandBuilder } from "@discordjs/builders";
import type {
  APIInteraction,
  APIInteractionResponse,
} from "discord-api-types/v10";

export const data = new SlashCommandBuilder()
  .setName("ascii-png")
  .setDescription("Convert an image to a PNG of ASCII art.")
  .addAttachmentOption((opt) =>
    opt
      .setName("image")
      .setDescription("Upload an image to convert")
      .setRequired(false),
  )
  .addStringOption((opt) =>
    opt
      .setName("url")
      .setDescription("Direct link to an image to convert")
      .setRequired(false),
  )
  .addIntegerOption((opt) =>
    opt.setName("width").setDescription("Max width in characters"),
  )
  .addBooleanOption((opt) =>
    opt.setName("braille").setDescription("Use braille characters"),
  )
  .addBooleanOption((opt) =>
    opt.setName("dither").setDescription("Apply dithering for braille"),
  )
  .addBooleanOption((opt) =>
    opt.setName("color").setDescription("ANSI color output"),
  )
  .addBooleanOption((opt) =>
    opt.setName("complex").setDescription("Use complex ASCII characters"),
  )
  .addStringOption((opt) =>
    opt.setName("map").setDescription("Custom ASCII map"),
  )
  .addStringOption((opt) =>
    opt
      .setName("save_bg")
      .setDescription("Background RGBA for PNG, e.g. 255,255,255,100"),
  );

export async function executeHTTP(
  interaction: APIInteraction,
): Promise<APIInteractionResponse> {
  // TODO: Parse options, run ascii-image-converter with --save-img, return deferred and follow-up
  return {
    type: 4,
    data: { content: "ASCII PNG conversion stub." },
  };
}
