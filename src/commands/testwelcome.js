const { SlashCommandBuilder } = require('discord.js');
const { generateWelcomeImage } = require('cwk-gen');
const config = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('testwelcome')
    .setDescription('Simulates a welcome image for testing purposes'),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const member = interaction.member;

      const buffer = await generateWelcomeImage({
        username: member.user.username,
        avatarURL: member.user.displayAvatarURL({ extension: 'png', size: 512 }),
        title: `WELCOME TO ${interaction.guild.name.toUpperCase()}`,
        message: `You're our ${interaction.guild.memberCount}th member!`,
        color: config.defaultEmbedColor,
        background: config.welcomeBackground || null
      });

      const welcomeChannel = interaction.guild.channels.cache.get(config.welcomeChannelId);
      if (!welcomeChannel) {
        await interaction.editReply('Welcome channel not found.');
        return;
      }

      await welcomeChannel.send({
        content: `Hey ${member.user}, welcome to the server!`,
        files: [{
          attachment: buffer,
          name: 'welcome.png'
        }]
      });

      await interaction.editReply('Welcome message sent!');
    } catch (error) {
      console.error('Error running /testwelcome:', error);
      await interaction.editReply('Failed to send welcome message.');
    }
  }
};