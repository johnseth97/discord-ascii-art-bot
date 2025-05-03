// src/commands/ascii.ts

import { SlashCommandBuilder } from "@discordjs/builders";
import type {
  APIInteraction,
  APIInteractionResponse,
} from "discord-api-types/v10";
import { spawn } from "child_process";
import { download } from "../utils/download";
import * as os from "os";
import * as path from "path";
import { rename, writeFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";

/**
 * ASCII Command: converts images to text, PNG, or GIF via ascii-image-converter.
 */
export const data = new SlashCommandBuilder()
  .setName("ascii")
  .setDescription(
    "Convert an image to ASCII art (text, PNG, or GIF). Provide an attachment or URL.",
  )
  .addStringOption((opt) =>
    opt
      .setName("output")
      .setDescription("Output format")
      .setRequired(true)
      .addChoices(
        { name: "Text (ANSI)", value: "text" },
        { name: "PNG Image", value: "png" },
        { name: "GIF Animation", value: "gif" },
      ),
  )
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
  .addStringOption((opt) =>
    opt
      .setName("quality")
      .setDescription("Quality mode for images")
      .addChoices(
        { name: "Standard", value: "standard" },
        { name: "Max Resolution", value: "max" },
      ),
  )
  .addBooleanOption((opt) =>
    opt.setName("braille").setDescription("Use braille characters"),
  )
  .addBooleanOption((opt) =>
    opt.setName("dither").setDescription("Apply dithering (braille only)"),
  )
  .addBooleanOption((opt) =>
    opt.setName("color").setDescription("ANSI color output"),
  )
  .addBooleanOption((opt) =>
    opt
      .setName("complex")
      .setDescription("Use complex ascii characters for higher quality"),
  )
  .addStringOption((opt) =>
    opt.setName("map").setDescription("Custom ascii map (dark-to-light)"),
  )
  .addIntegerOption((opt) =>
    opt.setName("width").setDescription("Max width in characters"),
  )
  .addStringOption((opt) =>
    opt
      .setName("save_bg")
      .setDescription("Background RGBA for PNG/GIF, e.g. 255,255,255,100"),
  )
  .addBooleanOption((opt) =>
    opt
      .setName("color_bg")
      .setDescription("Use color as background for ANSI text output"),
  );

/**
 * HTTP handler for the ascii command. Returns an InteractionResponse JSON.
 */
export async function executeHTTP(
  interaction: APIInteraction,
): Promise<APIInteractionResponse> {
  // TODO: extract options from interaction.data.options, download image, run converter,
  // and construct a response. For complex flows you may need to send a deferred response
  // (type=5) and then follow up via the webhook API.

  return {
    type: 4,
    data: {
      content: "⏳ Processing your ASCII conversion... (not yet implemented)",
    },
  };
}
