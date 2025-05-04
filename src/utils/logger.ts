// src/utils/logger.ts
import winston from "winston";

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Determine log level based on NODE_ENV
const env = process.env.NODE_ENV || "development";
function getLogLevel(): string {
  switch (env) {
    case "development":
      return "silly";
    case "testing":
      return "debug";
    case "production":
      return "info";
    default:
      return "debug";
  }
}

console.info("Log level:", getLogLevel());

// Build formats array
const formats = [
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
];

// Add colorized output for non-production
if (env !== "production") {
  formats.unshift(colorize());
}

// Pretty-print logs
formats.push(
  printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `${timestamp} ${level}: ${stack}`
      : `${timestamp} ${level}: ${message}`;
  }),
);

export const logger = winston.createLogger({
  level: getLogLevel(),
  format: combine(...formats),
  transports: [new winston.transports.Console()],
  exitOnError: false,
});
