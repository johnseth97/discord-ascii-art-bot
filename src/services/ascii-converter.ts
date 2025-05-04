// src/services/ascii-converter.ts

import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import os from "os";
import path from "path";

const execFileAsync = promisify(execFile);

export interface ConverterOptions {
  flags: string[];
}

/**
 * Convert an image to ANSI/text output.
 * Returns the ASCII text as a string.
 */
export async function convertText(
  inputPath: string,
  options: ConverterOptions,
): Promise<string> {
  const saveDir = os.tmpdir();
  const base = path.basename(inputPath, path.extname(inputPath));
  const args = [
    inputPath,
    "--save-txt",
    saveDir,
    "--only-save",
    "--ansi",
    ...options.flags,
  ];
  await execFileAsync("ascii-image-converter", args);
  const outputPath = path.join(saveDir, `${base}-ascii-art.txt`);
  return fs.readFileSync(outputPath, "utf-8");
}

/**
 * Convert an image to PNG output.
 * Returns the PNG bytes as a Buffer.
 */
export async function convertPNG(
  inputPath: string,
  options: ConverterOptions,
): Promise<Buffer> {
  const saveDir = os.tmpdir();
  const base = path.basename(inputPath, path.extname(inputPath));
  // ensure default sizing and font-color
  const flags = [...options.flags];
  const hasSizing = flags.some(
    (f) => f === "--width" || f === "--dimensions" || f === "--full",
  );
  if (!hasSizing) {
    flags.unshift("--full"); // default to full dimensions
  }
  // default glyph color: black on white by default
  const defaultFontColor = ["--font-color", "0,0,0"];

  const args = [
    inputPath,
    "--save-img",
    saveDir,
    "--only-save",
    ...defaultFontColor,
    ...flags,
  ];

  await execFileAsync("ascii-image-converter", args);
  const outputPath = path.join(saveDir, `${base}-ascii-art.png`);
  return fs.readFileSync(outputPath);
}

/**
 * Convert an image to GIF output.
 * Returns the GIF bytes as a Buffer.
 */
export async function convertGIF(
  inputPath: string,
  options: ConverterOptions,
): Promise<Buffer> {
  const saveDir = os.tmpdir();
  const base = path.basename(inputPath, path.extname(inputPath));
  const args = [
    inputPath,
    "--save-gif",
    saveDir,
    "--only-save",
    ...options.flags,
  ];
  await execFileAsync("ascii-image-converter", args);
  const outputPath = path.join(saveDir, `${base}-ascii-art.gif`);
  return fs.readFileSync(outputPath);
}
