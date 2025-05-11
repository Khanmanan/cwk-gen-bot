const { SlashCommandBuilder } = require('discord.js');
const { generateRankCard } = require('cwk-gen');
const { getUserStats, getLeaderboard } = require('../utils/xpSystem'); // Fixed missing import
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
      
      // Get rank position with proper error handling
      const leaderboard = await getLeaderboard(1000);
      const position = leaderboard.findIndex(u => u.userId === user.id);
      const rank = position >= 0 ? position + 1 : "1000+";
      
      const buffer = await generateRankCard({
        username: user.username,
        avatarURL: user.displayAvatarURL({ extension: 'png', size: 512 }),
        level: stats.level,
        xp: stats.xp,
        requiredXp: stats.requiredXP,
        rank,
        background: config.rankCardBackground || null, // Add custom background from config
        color: config.defaultEmbedColor || '#5865F2', // Fallback color
        progressColor: config.progressColor || '#FFFFFF' // Custom progress bar color
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
