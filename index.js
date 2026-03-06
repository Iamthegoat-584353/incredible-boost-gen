const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
require('dotenv').config();

const TOKEN = process.env.TOKEN; // keep token in .env
const CLIENT_ID = process.env.CLIENT_ID;

const ALLOWED_USERS = [
'1471837933429325855'
];

const OWNER_IDS = [
'YOUR_ID_1',
'YOUR_ID_2'
];

const BOOSTER_ROLE_ID = '1472619966040637562';
const GEN_CHANNEL_ID = '1477010131035230394';

const client = new Client({
intents: [GatewayIntentBits.Guilds]
});

const commands = [
new SlashCommandBuilder()
.setName('gen')
.setDescription('Generate something'),

new SlashCommandBuilder()
.setName('owner')
.setDescription('Owner only command')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
try {
console.log('Registering commands...');
await rest.put(
Routes.applicationCommands(CLIENT_ID),
{ body: commands }
);
console.log('Commands registered.');
} catch (error) {
console.error(error);
}
})();

client.on('interactionCreate', async interaction => {
if (!interaction.isChatInputCommand()) return;

if (interaction.commandName === 'gen') {

if (interaction.channelId !== GEN_CHANNEL_ID) {
return interaction.reply({ content: '❌ You can only use this command in the gen channel.', ephemeral: true });
}

const member = interaction.member;

if (
!ALLOWED_USERS.includes(interaction.user.id) &&
!member.roles.cache.has(BOOSTER_ROLE_ID)
) {
return interaction.reply({ content: '❌ You are not allowed to use this command.', ephemeral: true });
}

await interaction.reply('✅ Generation started!');
}

if (interaction.commandName === 'owner') {

if (!OWNER_IDS.includes(interaction.user.id)) {
return interaction.reply({ content: '❌ Owner only command.', ephemeral: true });
}

await interaction.reply('👑 Owner command executed.');
}

});

client.once('ready', () => {
console.log(`Logged in as ${client.user.tag}`);
});

client.login(TOKEN);