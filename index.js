const { Client, GatewayIntentBits } = require("discord.js");
const config = require("./config");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const cooldown = new Map();
let genEnabled = true;

function random(length) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).split(/ +/);
  const cmd = args.shift().toLowerCase();

  const isOwnerRole = message.member.roles.cache.has(config.ownerRole);
  const isAdminRole = message.member.roles.cache.has(config.adminRole);

  // ENABLE GEN
  if (cmd === "enablegen") {
    if (!isOwnerRole && !isAdminRole) return;

    genEnabled = true;
    message.reply("✅ Generator enabled.");
  }

  // DISABLE GEN
  if (cmd === "disablegen") {
    if (!isOwnerRole && !isAdminRole) return;

    genEnabled = false;
    message.reply("❌ Generator disabled.");
  }

  // GEN COMMAND
  if (cmd === "gen") {
    if (!genEnabled) {
      return message.reply("❌ Generator is currently disabled.");
    }

    const hasBooster = message.member.roles.cache.has(config.boosterRole);
    const allowedUser = config.allowedUsers.includes(message.author.id);

    if (!hasBooster && !allowedUser) {
      return message.reply("❌ You are not allowed to use this generator.");
    }

    if (cooldown.has(message.author.id)) {
      const time = cooldown.get(message.author.id) - Date.now();

      if (time > 0) {
        const minutes = Math.ceil(time / 60000);
        return message.reply(`⏳ Wait ${minutes} minutes before using .gen again.`);
      }
    }

    cooldown.set(message.author.id, Date.now() + config.cooldown);

    const steam = random(3);
    const minecraft = random(5);
    const crunchyroll = random(6);

    message.reply(
`🎁 **Generated Accounts**

Steam: \`${steam}\`
Minecraft: \`${minecraft}\`
Crunchyroll: \`${crunchyroll}\`
`
    );
  }
});

client.login(config.token);