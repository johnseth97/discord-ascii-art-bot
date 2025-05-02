// src/commands/ascii.ts
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { spawn } from "child_process";
import { download } from "../utils/download";
import * as os from "os";
import * as path from "path";
import { rename, writeFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";

export const data = new SlashCommandBuilder()
  .setName("ascii")
  .setDescription("Convert an image to ASCII art or PNG representation")
  .addAttachmentOption((opt) =>
    opt.setName("image").setDescription("Image to convert").setRequired(true),
  )
  .addBooleanOption((opt) =>
    opt.setName("braille").setDescription("Use braille characters"),
  )
  .addBooleanOption((opt) =>
    opt.setName("dither").setDescription("Apply dithering (for braille)"),
  )
  .addBooleanOption((opt) =>
    opt.setName("color").setDescription("ANSI color output"),
  )
  .addIntegerOption((opt) =>
    opt.setName("width").setDescription("Max width in characters"),
  )
  .addStringOption((opt) =>
    opt
      .setName("output")
      .setDescription("Output format")
      .addChoices(
        { name: "Text (ANSI)", value: "text" },
        { name: "PNG Image", value: "png" },
      ),
  );

export async function execute(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  await interaction.deferReply();

  // Download & rename input to deterministic path
  const attachment = interaction.options.getAttachment("image", true);
  const orig = await download(attachment.url);
  const ext = path.extname(orig) || ".png";
  const id = randomUUID();
  const inputPath = path.join(os.tmpdir(), `${id}${ext}`);
  await rename(orig, inputPath);

  // Read options
  const output = interaction.options.getString("output") ?? "text";
  const useBraille = interaction.options.getBoolean("braille") ?? false;
  const useDither = interaction.options.getBoolean("dither") ?? false;
  const useColor = interaction.options.getBoolean("color") ?? false;
  const DEFAULT_WIDTH = 80;
  const w = interaction.options.getInteger("width");
  const width = typeof w === "number" ? w : DEFAULT_WIDTH;

  // PNG branch
  if (output === "png") {
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
    proc.stderr.on("data", (c) => (stderr += c.toString()));
    proc.on("close", async (code) => {
      try {
        if (code !== 0) {
          console.error("PNG conversion error:", stderr);
          return await interaction.editReply({
            content: `❌ PNG conversion failed (exit code ${code}).`,
          });
        }
        await interaction.editReply({
          files: [{ attachment: outputFile, name: `${id}-ascii-art.png` }],
        });
      } finally {
        // Cleanup temp files
        await unlink(inputPath).catch(() => {});
        await unlink(outputFile).catch(() => {});
      }
    });
    return;
  }

  // Text branch (ANSI)
  const argsText = [
    inputPath,
    "--width",
    width.toString(),
    ...(useColor ? ["--color"] : []),
    ...(useBraille ? ["--braille"] : []),
    ...(useDither ? ["--dither"] : []),
  ];
  const cmd = `ascii-image-converter ${argsText.map((a) => (a.includes(" ") ? `"${a}"` : a)).join(" ")}`;
  const procText = spawn("script", ["-qfc", cmd, "/dev/null"], {
    env: {
      ...process.env,
      TERM: "xterm-256color",
      COLORTERM: "8bit",
      FORCE_COLOR: "1",
    },
  });
  let stdout = "";
  let stderr = "";
  procText.stdout.on("data", (c) => (stdout += c.toString()));
  procText.stderr.on("data", (c) => (stderr += c.toString()));
  procText.on("close", async (code) => {
    const txtFile = path.join(os.tmpdir(), `${id}.ansi.txt`);
    try {
      if (code !== 0) {
        console.error("Text conversion error:", stderr);
        return await interaction.editReply({
          content: `❌ Text conversion failed (exit code ${code}).`,
        });
      }
      const colored = stdout + "\u001b[0m";
      if (colored.length > 1900) {
        await writeFile(txtFile, colored);
        return await interaction.editReply({
          content: "Output too long; sending as text file.",
          files: [{ attachment: txtFile, name: "ascii.txt" }],
        });
      } else {
        return await interaction.editReply({
          content: `\`\`\`ansi\n${colored}\n\`\`\``,
        });
      }
    } finally {
      // Cleanup temp files
      await unlink(inputPath).catch(() => {});
      await unlink(txtFile).catch(() => {});
    }
  });
}
