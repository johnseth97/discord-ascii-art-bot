// src/commands/gif.ts
import { SlashCommandBuilder } from "@discordjs/builders";
import type {
  APIInteraction,
  APIInteractionResponse,
} from "discord-api-types/v10";

export const data = new SlashCommandBuilder()
  .setName("gif")
  .setDescription("Convert an animated GIF to ASCII-art animation.")
  .addAttachmentOption((opt) =>
    opt
      .setName("gif")
      .setDescription("Upload a GIF file to convert")
      .setRequired(true),
  )
  .addStringOption((opt) =>
    opt
      .setName("save_bg")
      .setDescription("Optional background RGBA for output GIF"),
  );

export async function executeHTTP(
  interaction: APIInteraction,
): Promise<APIInteractionResponse> {
  // TODO: run ascii-image-converter with --save-gif
  return {
    type: 4,
    data: { content: "GIF conversion endpoint pending." },
  };
}
