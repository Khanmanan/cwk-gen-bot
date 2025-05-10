const { SlashCommandBuilder } = require('discord.js');
const { generateServerBanner } = require('cwk-gen');
const config = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverbanner')
    .setDescription('Generate a banner for this server'),
  async execute(interaction) {
    try {
      await interaction.deferReply();
      
      const buffer = await generateServerBanner({
        serverName: interaction.guild.name,
        memberCount: interaction.guild.memberCount,
        color: config.defaultEmbedColor
      });

      await interaction.editReply({
        content: `**${interaction.guild.name}** Banner`,
        files: [{
          attachment: buffer,
          name: 'banner.png'
        }]
      });
    } catch (error) {
      console.error('Error executing serverbanner command:', error);
      await interaction.editReply('There was an error generating the server banner.');
    }
  }
};
