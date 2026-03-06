const { Client, GatewayIntentBits, EmbedBuilder, Partials } = require("discord.js");
const { token } = require("./config");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

const prefix = ".";
const OWNER_ID = "1471837933429325855";

const COOLDOWN_TIME = 60 * 60 * 1000; // 1 hour

const BANNER_URL = "https://cdn.discordapp.com/attachments/1474387569818079395/1476581540740726979/lv_0_20260226193526.gif";

let generatorEnabled = true;
const cooldown = new Map();

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});


// ================= GENERATORS =================

function randomChars(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}


// ================= MESSAGE =================

client.on("messageCreate", async (message) => {

  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();


  // ================= OWNER COMMANDS =================

  if (command === "disablegen") {

    if (message.author.id !== OWNER_ID)
      return message.reply("❌ Owner only.");

    generatorEnabled = false;

    return message.reply("🛑 Generator DISABLED.");
  }


  if (command === "enablegen") {

    if (message.author.id !== OWNER_ID)
      return message.reply("❌ Owner only.");

    generatorEnabled = true;

    return message.reply("✅ Generator ENABLED.");
  }


  if (command === "resetcooldown") {

    if (message.author.id !== OWNER_ID)
      return message.reply("❌ Owner only.");

    const user = message.mentions.users.first();

    if (!user) return message.reply("❌ Mention a user.");

    cooldown.delete(`${user.id}-steam`);
    cooldown.delete(`${user.id}-minecraft`);
    cooldown.delete(`${user.id}-crunchyroll`);

    return message.reply(`✅ Cooldown reset for ${user.tag}`);
  }


  // ================= GENERATOR =================

  if (command === "gen") {

    if (!generatorEnabled)
      return message.reply("🛑 Generator is disabled.");

    const type = args[0]?.toLowerCase();

    if (!type) {
      return message.reply(
        "❌ Usage: `.gen steam | minecraft | crunchyroll`"
      );
    }

    if (!["steam","minecraft","crunchyroll"].includes(type)) {
      return message.reply(
        "❌ Invalid generator.\nUse: `.gen steam | minecraft | crunchyroll`"
      );
    }


    const now = Date.now();
    const cooldownKey = `${message.author.id}-${type}`;

    if (cooldown.has(cooldownKey)) {

      const expiration = cooldown.get(cooldownKey) + COOLDOWN_TIME;

      if (now < expiration) {

        const timeLeft = expiration - now;

        const minutes = Math.floor(timeLeft / 60000);

        return message.reply(`⏳ Wait ${minutes} minutes before generating again.`);
      }
    }

    cooldown.set(cooldownKey, now);


    let generated;
    let instruction;


    if (type === "steam") {

      generated = randomChars(3);
      instruction = "This is a 3 character Steam code.";

    }


    if (type === "minecraft") {

      generated = randomChars(5);
      instruction = "This is a 5 character Minecraft code.";

    }


    if (type === "crunchyroll") {

      generated = randomChars(6);
      instruction = "This is a 6 character Crunchyroll code.";

    }



    const serverEmbed = new EmbedBuilder()
      .setTitle("✅ Generation Successful")
      .setDescription("📩 Check your DMs.")
      .setImage(BANNER_URL)
      .setColor("#8e44ff");


    await message.reply({ embeds: [serverEmbed] });


    const dmEmbed = new EmbedBuilder()
      .setTitle(`Incredible Gen ${type}`)
      .setDescription(
`Do the following:

1. Go to tickets
2. Give this code to staff

**Your Code: ${generated}**

${instruction}`
      )
      .setImage(BANNER_URL)
      .setColor("#8e44ff");


    try {

      await message.author.send({ embeds: [dmEmbed] });

    } catch {

      await message.reply("❌ I cannot DM you.");
    }

  }

});


client.login(token);