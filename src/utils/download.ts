// src/utils/download.ts
import { writeFile } from "fs/promises";
import * as os from "os";
import * as path from "path";
import { randomUUID } from "crypto";

export async function download(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
    );
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const tmpDir = os.tmpdir();
  const filePath = path.join(tmpDir, `${randomUUID()}.png`);
  await writeFile(filePath, buffer);
  return filePath;
}
