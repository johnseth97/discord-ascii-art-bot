// src/commands/complex.ts
import { SlashCommandBuilder } from "@discordjs/builders";
import type {
  APIInteraction,
  APIInteractionResponse,
} from "discord-api-types/v10";

export const data = new SlashCommandBuilder()
  .setName("complex")
  .setDescription(
    "Convert an image with a larger range of ascii characters for higher quality.",
  )
  .addAttachmentOption((opt) =>
    opt
      .setName("image")
      .setDescription("Upload an image to convert")
      .setRequired(true),
  )
  .addIntegerOption((opt) =>
    opt.setName("width").setDescription("Max width in characters"),
  );

export async function executeHTTP(
  interaction: APIInteraction,
): Promise<APIInteractionResponse> {
  // TODO: extract 'width' and 'image', run ascii-image-converter with --complex
  return {
    type: 4,
    data: { content: "Complex conversion coming soon." },
  };
}
