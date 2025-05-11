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

      const member = interaction.options.getMember('user') || interaction.member;
      const user = member.user;
      const stats = await getUserStats(user.id);

      // Emoji-based badge system
      const badges = [
        { name: "Member", icon: "👤", description: "Default badge", type: "emoji" },
        { name: "Active", icon: "💬", description: "Active speaker", type: "emoji" },
        ...(stats.level > 10 ? [{ name: "Veteran", icon: "🎖️", description: "Level 10+", type: "emoji" }] : []),
        ...(stats.level > 20 ? [{ name: "Elite", icon: "🌟", description: "Level 20+", type: "emoji" }] : []),
        ...(stats.level > 30 ? [{ name: "Legend", icon: "🔥", description: "Level 30+", type: "emoji" }] : []),
      ];

      const joinDate = new Date(member.joinedAt).toLocaleDateString('en-US');

      const buffer = await generateProfileCard({
        username: user.username,
        avatarURL: user.displayAvatarURL({ extension: 'png', size: 512 }),
        bio: config.profileBio || `${user.username}'s profile on ${interaction.guild.name}`,
        stats: [
          { name: "Level", value: stats.level.toString() },
          { name: "XP", value: `${stats.xp}/${stats.requiredXP}` },
          { name: "Joined", value: joinDate },
          { name: "Rank", value: `#${stats.rank || "N/A"}` }
        ],
        badges,
        background: config.profileBackground || null,
        color: config.defaultEmbedColor || '#5865F2',
        textColor: config.profileTextColor || '#2ea8e7',
        badgeStyle: config.badgeStyle || 'circle'
      });

      await interaction.editReply({
        content: `${user.username}'s profile`,
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