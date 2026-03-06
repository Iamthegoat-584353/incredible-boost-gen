const { Client, GatewayIntentBits, EmbedBuilder, Partials } = require("discord.js");
const { token } = require("./config");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

const prefix = ".";

const OWNERS = [
  "1121404311319089153",
  "1471837933429325855"
];

const BOOSTER_ROLE = "1472619966040637562";
const ADMIN_ROLE = "1478005454495023104";
const OWNER_ROLE = "1465398989200425204";

const COOLDOWN_TIME = 60 * 60 * 1000;

const BANNER_URL = "https://cdn.discordapp.com/attachments/1474387569818079395/1476581540740726979/lv_0_20260226193526.gif";

let generatorEnabled = true;

const cooldown = new Map();

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

function randomString(length) {

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {

    result += chars[Math.floor(Math.random() * chars.length)];

  }

  return result;
}

client.on("messageCreate", async (message) => {

  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const member = message.member;
  const isOwner = OWNERS.includes(message.author.id);

  // ================= OWNER COMMANDS =================

  if (command === "disablegen") {

    if (!isOwner)
      return message.reply("❌ Owner only.");

    generatorEnabled = false;

    return message.reply("🛑 Generator disabled.");
  }

  if (command === "enablegen") {

    if (!isOwner)
      return message.reply("❌ Owner only.");

    generatorEnabled = true;

    return message.reply("✅ Generator enabled.");
  }

  // ================= GENERATOR =================

  if (command === "gen") {

    if (!generatorEnabled)
      return message.reply("🛑 Generator is currently disabled.");

    if (
      !member.roles.cache.has(BOOSTER_ROLE) &&
      !member.roles.cache.has(ADMIN_ROLE) &&
      !member.roles.cache.has(OWNER_ROLE) &&
      !OWNERS.includes(message.author.id)
    ) {
      return message.reply("❌ Only boosters, admins, or owners can use this generator.");
    }

    const type = args[0]?.toLowerCase();

    if (!type)
      return message.reply("❌ Usage: `.gen steam | minecraft | crunchyroll`");

    if (!["steam", "minecraft", "crunchyroll"].includes(type)) {
      return message.reply("❌ Invalid generator type.");
    }

    const now = Date.now();
    const cooldownKey = `${message.author.id}-${type}`;

    if (cooldown.has(cooldownKey)) {

      const expiration = cooldown.get(cooldownKey) + COOLDOWN_TIME;

      if (now < expiration) {

        const timeLeft = expiration - now;

        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);

        return message.reply(`⏳ Wait ${minutes}m ${seconds}s before generating ${type} again.`);
      }
    }

    cooldown.set(cooldownKey, now);

    let generated;
    let instruction;

    if (type === "steam") {
      generated = randomString(3);
      instruction = "This is a 3 character Steam code.";
    }

    if (type === "minecraft") {
      generated = randomString(5);
      instruction = "This is a 5 character Minecraft code.";
    }

    if (type === "crunchyroll") {
      generated = randomString(6);
      instruction = "This is a 6 character Crunchyroll code.";
    }

    const serverEmbed = new EmbedBuilder()
      .setTitle("✅ Generation Successful")
      .setDescription("📩 Check your DMs for the code.")
      .setColor("#8e44ff")
      .setImage(BANNER_URL);

    await message.reply({ embeds: [serverEmbed] });

    const dmEmbed = new EmbedBuilder()
      .setTitle(`Incredible Gen ${type.charAt(0).toUpperCase() + type.slice(1)}`)
      .setDescription(
`Do the following for your account:

1. Go to the tickets channel
2. Give this code to staff

**Your Code: ${generated}**

${instruction}`
      )
      .setColor("#8e44ff")
      .setImage(BANNER_URL);

    try {

      await message.author.send({ embeds: [dmEmbed] });

    } catch {

      message.reply("❌ I cannot DM you. Enable DMs.");
    }

  }

});

client.login(token);