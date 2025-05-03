// src/commands/ascii.ts
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  SlashCommandAttachmentOption,
  SlashCommandStringOption,
  SlashCommandBooleanOption,
  SlashCommandIntegerOption,
} from "discord.js";
import { spawn } from "child_process";
import { download } from "../utils/download";
import * as os from "os";
import * as path from "path";
import { rename, writeFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";

export const data = new SlashCommandBuilder()
  .setName("ascii")
  .setDescription(
    "Convert an image to ASCII art or PNG representation. Provide either an attachment or a URL.",
  )
  // Required options first
  .addStringOption((opt: SlashCommandStringOption) =>
    opt
      .setName("output")
      .setDescription("Output format: text or png")
      .addChoices(
        { name: "Text (ANSI)", value: "text" },
        { name: "PNG Image", value: "png" },
      )
      .setRequired(true),
  )
  // Optional inputs
  .addAttachmentOption((opt: SlashCommandAttachmentOption) =>
    opt
      .setName("image")
      .setDescription("Upload an image to convert")
      .setRequired(false),
  )
  .addStringOption((opt: SlashCommandStringOption) =>
    opt
      .setName("url")
      .setDescription("Direct link to an image to convert")
      .setRequired(false),
  )
  .addStringOption((opt: SlashCommandStringOption) =>
    opt
      .setName("quality")
      .setDescription("Quality mode: embedding or max resolution")
      .addChoices(
        { name: "Standard (embedded)", value: "standard" },
        { name: "Max (no embed, full resolution)", value: "max" },
      ),
  )
  .addBooleanOption((opt: SlashCommandBooleanOption) =>
    opt.setName("braille").setDescription("Use braille characters"),
  )
  .addBooleanOption((opt: SlashCommandBooleanOption) =>
    opt.setName("dither").setDescription("Apply dithering (for braille)"),
  )
  .addBooleanOption((opt: SlashCommandBooleanOption) =>
    opt.setName("color").setDescription("ANSI color output"),
  )
  .addIntegerOption((opt: SlashCommandIntegerOption) =>
    opt.setName("width").setDescription("Max width in characters"),
  );

export async function execute(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  await interaction.deferReply();

  // Require either attachment or URL
  const attachment = interaction.options.getAttachment("image");
  const urlString = interaction.options.getString("url");
  if (!attachment && !urlString) {
    await interaction.editReply({
      content: "❌ You must provide either an image attachment or a URL.",
    });
    return;
  }

  const imageUrl = attachment?.url ?? urlString!;
  const originalPath = await download(imageUrl);
  const ext = path.extname(originalPath) || ".png";
  const id = randomUUID();
  const inputPath = path.join(os.tmpdir(), `${id}${ext}`);
  await rename(originalPath, inputPath);

  const output = interaction.options.getString("output")!;
  const quality = interaction.options.getString("quality") ?? "standard";
  const useBraille = interaction.options.getBoolean("braille") ?? false;
  const useDither = interaction.options.getBoolean("dither") ?? false;
  const useColor = interaction.options.getBoolean("color") ?? false;
  const w = interaction.options.getInteger("width");
  const width = typeof w === "number" ? w : 80;

  if (output === "png") {
    // PNG output
    const tmpDir = os.tmpdir();
    const outputFile = path.join(tmpDir, `${id}-ascii-art.png`);
    const args = [
      inputPath,
      "--width",
      width.toString(),
      ...(useColor ? ["--color"] : []),
      ...(useBraille ? ["--braille"] : []),
      ...(useDither ? ["--dither"] : []),
      "--save-img",
      tmpDir,
      "--only-save",
    ];

    const proc = spawn("ascii-image-converter", args, {
      env: {
        ...process.env,
        TERM: "xterm-256color",
        COLORTERM: "truecolor",
        FORCE_COLOR: "1",
      },
    });
    let stderr = "";
    proc.stderr.on("data", (chunk) => (stderr += chunk.toString()));

    proc.on("close", async (code) => {
      try {
        if (code !== 0) {
          console.error("PNG conversion error:", stderr);
          await interaction.editReply({
            content: `❌ PNG conversion failed (exit code ${code}).`,
          });
          return;
        }
        const base = `${id}-ascii-art.png`;
        const name = quality === "max" ? `SPOILER_${base}` : base;
        // Send the file, then cleanup
        await interaction.editReply({
          files: [{ attachment: outputFile, name }],
        });
      } finally {
        // cleanup after upload
        await unlink(inputPath).catch(() => {});
        await unlink(outputFile).catch(() => {});
      }
    });
    return;
  }

  // Text/ANSI output
  const argsText = [
    inputPath,
    "--width",
    width.toString(),
    ...(useColor ? ["--color"] : []),
    ...(useBraille ? ["--braille"] : []),
    ...(useDither ? ["--dither"] : []),
  ];
  const cmd = `ascii-image-converter ${argsText
    .map((a) => (a.includes(" ") ? `"${a}"` : a))
    .join(" ")}`;
  const procText = spawn("script", ["-qfc", cmd, "/dev/null"], {
    env: {
      ...process.env,
      TERM: "xterm-256color",
      COLORTERM: "24bit",
      FORCE_COLOR: "1",
    },
  });

  let stdout = "";
  let stderrText = "";
  procText.stdout.on("data", (chunk) => (stdout += chunk.toString()));
  procText.stderr.on("data", (chunk) => (stderrText += chunk.toString()));
  procText.on("close", async (code) => {
    const txtFile = path.join(os.tmpdir(), `${id}.ansi.txt`);
    try {
      if (code !== 0) {
        console.error("Text conversion error:", stderrText);
        await interaction.editReply({
          content: `❌ Text conversion failed (exit code ${code}).`,
        });
        return;
      }
      const colored = stdout + "\u001b[0m";
      if (colored.length > 1900) {
        await writeFile(txtFile, colored);
        await interaction.editReply({
          content: "Output too long; sending as text file.",
          files: [{ attachment: txtFile, name: "ascii.txt" }],
        });
      } else {
        await interaction.editReply({
          content: `\`\`\`ansi
${colored}
\`\`\``,
        });
      }
    } finally {
      await unlink(inputPath).catch(() => {});
      await unlink(txtFile).catch(() => {});
    }
  });
}
