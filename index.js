const { Client, GatewayIntentBits, EmbedBuilder, Partials, PermissionsBitField } = require("discord.js");
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

/* OWNER USERS */
const OWNERS = [
  "1121404311319089153",
  "1471837933429325855"
];

/* BOOSTER ROLE */
const BOOSTER_ROLE = "1472619966040637562";

/* STAFF ROLE */
const STAFF_ROLE = "1465398987094888510";

/* GEN CHANNEL */
const GEN_CHANNEL = "1477010131035230394";

/* COOLDOWN */
const COOLDOWN_TIME = 60 * 60 * 1000;

/* BANNER */
const BANNER_URL =
"https://cdn.discordapp.com/attachments/1474387569818079395/1476581540740726979/lv_0_20260226193526.gif";

/* STORAGE */
let generatorEnabled = true;
const cooldown = new Map();
const generatedCodes = new Set();
const redeemedCodes = new Set();

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

/* RANDOM STRING */
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

  /* ================= OWNER COMMANDS ================= */
  if (command === "disablegen") {
    if (!isOwner) return message.reply("❌ Owner only.");
    generatorEnabled = false;
    return message.reply("🛑 Generator disabled.");
  }

  if (command === "enablegen") {
    if (!isOwner) return message.reply("❌ Owner only.");
    generatorEnabled = true;
    return message.reply("✅ Generator enabled.");
  }

  /* ================= UNBAN ================= */
  if (command === "unban") {
    if (!member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply("❌ You need Ban Members permission.");

    const userId = args[0];
    if (!userId) return message.reply("❌ Usage: .unban <userID>");

    try {
      await message.guild.members.unban(userId);
      const embed = new EmbedBuilder()
        .setTitle("✅ User Unbanned")
        .setDescription(`User ID: ${userId}`)
        .setColor("#00ff00");
      message.channel.send({ embeds: [embed] });
    } catch {
      return message.reply("❌ Failed to unban user. Check the ID.");
    }
  }

  /* ================= BOOSTER GENERATOR (.bgen) ================= */
  if (command === "bgen") {
    if (message.channel.id !== GEN_CHANNEL) return;
    if (!generatorEnabled)
      return message.reply("🛑 Generator is currently disabled.");
    if (!member.roles.cache.has(BOOSTER_ROLE) && !isOwner)
      return message.reply("❌ Only boosters can use this generator.");

    const type = args[0]?.toLowerCase();
    if (!type) return message.reply("❌ Usage: `.bgen steam | minecraft | crunchyroll`");
    if (!["steam", "minecraft", "crunchyroll"].includes(type))
      return message.reply("❌ Invalid generator type.");

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
    if (type === "steam") { generated = randomString(3); instruction = "This is a 3 character Steam code."; }
    if (type === "minecraft") { generated = randomString(5); instruction = "This is a 5 character Minecraft code."; }
    if (type === "crunchyroll") { generated = randomString(6); instruction = "This is a 6 character Crunchyroll code."; }

    generatedCodes.add(generated);

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

    try { await message.author.send({ embeds: [dmEmbed] }); } 
    catch { message.reply("❌ I cannot DM you. Enable DMs."); }
  }

  /* ================= REDEEM ================= */
  if (command === "redeem") {
    const code = args[0];
    if (!code) return message.reply("❌ Usage: `.redeem <code>`");
    if (!generatedCodes.has(code)) return message.reply("❌ Fake or invalid code.");
    if (redeemedCodes.has(code)) return message.reply("❌ This code has already been redeemed.");

    redeemedCodes.add(code);

    const redeemEmbed = new EmbedBuilder()
      .setTitle("🎟 Code Redeemed")
      .setDescription(
`User: <@${message.author.id}>
Code: **${code}**

Staff please verify this code.`
      )
      .setColor("#8e44ff");

    message.channel.send({ content: `<@&${STAFF_ROLE}>`, embeds: [redeemEmbed] });
    message.reply("✅ Code sent to staff for verification.");
  }

});

client.login(token);