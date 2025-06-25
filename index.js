
// GameHub Bot - All-in-One Discord Bot
require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require('discord.js');
const config = require('./config.json');
const ms = require('ms');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

let xpData = {};

function addXP(userId) {
  if (!xpData[userId]) xpData[userId] = { xp: 0, level: 1 };
  xpData[userId].xp += 10;
  if (xpData[userId].xp >= xpData[userId].level * 100) {
    xpData[userId].level++;
  }
}

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const args = message.content.trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (config.features.leveling) addXP(message.author.id);

  if (command === '!help') {
    let desc = '';
    for (let feat in config.features) {
      if (config.features[feat]) desc += `✅ ${feat}\n`;
    }
    const embed = new EmbedBuilder().setTitle('🛠️ GameHub Features').setDescription(desc).setColor('Blue');
    return message.channel.send({ embeds: [embed] });
  }

  if (config.features.fun && command === '!joke') {
    return message.reply('😂 আমি এত অলস যে ঘুমিয়েও ক্লান্ত হয়ে যাই!');
  }

  if (config.features.leveling && command === '!rank') {
    const user = xpData[message.author.id] || { xp: 0, level: 1 };
    return message.reply(`📈 Level ${user.level} | XP ${user.xp}`);
  }

  if (config.features.moderation && command === '!kick') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return;
    const member = message.mentions.members.first();
    if (member) {
      await member.kick();
      return message.channel.send(`✅ ${member.user.username} has been kicked.`);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
