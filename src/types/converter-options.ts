// === src/types/converter-options.ts ===
// Shared types for command options and service returns

export interface BaseOptions {
  /** URL of the image to convert */
  imageUrl: string;
  /** Background color in RGBA format, e.g. "255,255,255,100" */
  backgroundColor?: string;
}

export interface TextOptions extends BaseOptions {
  width?: number;
  braille?: boolean;
  dither?: boolean;
}

export interface ImageOptions extends BaseOptions {
  width?: number;
  braille?: boolean;
  dither?: boolean;
  complex?: boolean;
  map?: string;
}

/**
 * Result of a conversion service.
 */
export type ConversionResult =
  | { type: "text"; content: string }
  | { type: "png"; buffer: Buffer; filename: string }
  | { type: "gif"; buffer: Buffer; filename: string };
