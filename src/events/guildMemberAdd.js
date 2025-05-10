const { generateWelcomeImage } = require('cwk-gen');
const config = require('../../config.json');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    try {
      const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannelId);
      if (!welcomeChannel) return;

      const buffer = await generateWelcomeImage({
        username: member.user.username,
        avatarURL: member.user.displayAvatarURL({ extension: 'png', size: 512 }),
        title: `WELCOME TO ${member.guild.name.toUpperCase()}`,
        message: `We're excited to have you here! You're our ${member.guild.memberCount}th member!`,
        color: config.defaultEmbedColor
      });

      await welcomeChannel.send({
        content: `Hey ${member.user}, welcome to the server!`,
        files: [{
          attachment: buffer,
          name: 'welcome.png'
        }]
      });
    } catch (error) {
      console.error('Error in guildMemberAdd event:', error);
    }
  }
};
