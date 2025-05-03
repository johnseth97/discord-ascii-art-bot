// text.ts
import { SlashCommandBuilder } from "@discordjs/builders";
import type {
  APIInteraction,
  APIInteractionResponse,
} from "discord-api-types/v10";

export const data = new SlashCommandBuilder()
  .setName("ascii-text")
  .setDescription("Convert an image to ANSI text ASCII art.")
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
    opt.setName("map").setDescription("Custom ASCII map (dark-to-light)"),
  )
  .addBooleanOption((opt) =>
    opt.setName("color_bg").setDescription("Color as background for ANSI"),
  );

export async function executeHTTP(
  interaction: APIInteraction,
): Promise<APIInteractionResponse> {
  // TODO: Parse options, run ascii-image-converter for text output, return response or deferred
  return {
    type: 4,
    data: { content: "ASCII text conversion stub." },
  };
}
