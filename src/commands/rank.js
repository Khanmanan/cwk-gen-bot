const { SlashCommandBuilder } = require('discord.js');
const { generateRankCard } = require('cwk-gen');
const { getUserStats } = require('../utils/xpSystem');
const config = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Check your rank and level')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to check')
        .setRequired(false)
    ),
  async execute(interaction) {
    try {
      await interaction.deferReply();
      
      const user = interaction.options.getUser('user') || interaction.user;
      const stats = await getUserStats(user.id);
      
      // Get rank position (simplified - in a real app you'd query the DB)
      const leaderboard = await getLeaderboard(1000);
      const rank = leaderboard.findIndex(u => u.userId === user.id) + 1 || 1000+;
      
      const buffer = await generateRankCard({
        username: user.username,
        avatarURL: user.displayAvatarURL({ extension: 'png', size: 512 }),
        level: stats.level,
        xp: stats.xp,
        requiredXp: stats.requiredXP,
        rank,
        color: config.defaultEmbedColor
      });

      await interaction.editReply({
        files: [{
          attachment: buffer,
          name: 'rank.png'
        }]
      });
    } catch (error) {
      console.error('Error executing rank command:', error);
      await interaction.editReply('There was an error generating your rank card.');
    }
  }
};
