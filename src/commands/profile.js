const { SlashCommandBuilder } = require('discord.js');
const { generateProfileCard } = require('cwk-gen');
const { getUserStats } = require('../utils/xpSystem');
const config = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your profile card')
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
      
      // In a real app, you'd have actual badges and bio from a database
      const mockBadges = [
        { name: "Member", icon: "👤" },
        { name: "Active", icon: "💬" }
      ];
      
      if (stats.level > 10) mockBadges.push({ name: "Veteran", icon: "🎖️" });
      if (stats.level > 20) mockBadges.push({ name: "Elite", icon: "🌟" });

      const buffer = await generateProfileCard({
        username: user.username,
        avatarURL: user.displayAvatarURL({ extension: 'png', size: 512 }),
        bio: `${user.username} is an awesome member of ${interaction.guild.name}!`,
        stats: [
          { name: "Level", value: stats.level.toString() },
          { name: "XP", value: `${stats.xp}/${stats.requiredXP}` },
          { name: "Joined", value: new Date(user.joinedTimestamp).toLocaleDateString() }
        ],
        badges: mockBadges,
        color: config.defaultEmbedColor
      });

      await interaction.editReply({
        files: [{
          attachment: buffer,
          name: 'profile.png'
        }]
      });
    } catch (error) {
      console.error('Error executing profile command:', error);
      await interaction.editReply('There was an error generating your profile card.');
    }
  }
};
