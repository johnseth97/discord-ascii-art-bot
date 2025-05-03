// index.ts
import {
  Client,
  GatewayIntentBits,
  Collection,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Interaction,
} from "discord.js";
import fs from "fs";
import path from "path";
import * as os from "os";
import { readdir, stat, unlink } from "fs/promises";
import { healthcheck } from "./utils/healthcheck.js";

healthcheck();

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
  console.log("Loaded .env file");
  console.log("Environment:", process.env.NODE_ENV);
  console.log("Client ID:", process.env.DISCORD_CLIENT_ID);
}

// Extend Client to include commands
declare module "discord.js" {
  interface Client {
    commands: Collection<
      string,
      {
        data: SlashCommandBuilder;
        execute(interaction: ChatInputCommandInteraction): Promise<void>;
      }
    >;
  }
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Load commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
for (const file of commandFiles) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { data, execute } = require(path.join(commandsPath, file));
  client.commands.set(data.name, { data, execute });
}

// Cleanup temp dir files older than 8 hours
async function cleanupTempDir() {
  const tmpDir = os.tmpdir();
  const files = await readdir(tmpDir);
  const now = Date.now();
  for (const file of files) {
    if (/^[0-9a-fA-F-]+(-ascii-art)?\.(png|txt)$/.test(file)) {
      const p = path.join(tmpDir, file);
      const stats = await stat(p);
      if (now - stats.mtimeMs > 8 * 3600 * 1000) {
        await unlink(p).catch(() => {});
      }
    }
  }
}

client.once("ready", async () => {
  console.log(`Logged in as ${client.user!.tag}`);
  await cleanupTempDir();
  setInterval(cleanupTempDir, 3600 * 1000);
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;
  try {
    await cmd.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "❌ Error while executing command",
      ephemeral: true,
    });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
