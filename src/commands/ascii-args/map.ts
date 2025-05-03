// src/commands/map.ts
import { SlashCommandBuilder } from "@discordjs/builders";
import type {
  APIInteraction,
  APIInteractionResponse,
} from "discord-api-types/v10";

export const data = new SlashCommandBuilder()
  .setName("map")
  .setDescription("Convert an image using a custom ascii map (dark-to-light).")
  .addStringOption((opt) =>
    opt
      .setName("map")
      .setDescription(
        "Specify your ascii characters ordered from darkest to lightest",
      )
      .setRequired(true),
  )
  .addAttachmentOption((opt) =>
    opt
      .setName("image")
      .setDescription("Upload an image to convert")
      .setRequired(true),
  );

export async function executeHTTP(
  interaction: APIInteraction,
): Promise<APIInteractionResponse> {
  // TODO: extract 'map' and 'image' option, run ascii-image-converter with --map
  return {
    type: 4,
    data: { content: "Map command is under construction." },
  };
}
