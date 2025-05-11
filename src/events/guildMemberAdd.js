const { generateWelcomeImage } = require('cwk-gen');
const config = require('../../config.json');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    try {
      const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannelId);
      if (!welcomeChannel) {
        console.warn(`Welcome channel not found (ID: ${config.welcomeChannelId})`);
        return;
      }

      // Customizable member count ordinal (1st, 2nd, 3rd, etc.)
      const ordinalSuffix = ['th', 'st', 'nd', 'rd'][
        (member.guild.memberCount % 100 > 10 && member.guild.memberCount % 100 < 14) ? 
        0 : member.guild.memberCount % 10
      ] || 'th';

      const buffer = await generateWelcomeImage({
        username: member.user.username,
        avatarURL: member.user.displayAvatarURL({ 
          extension: 'png', 
          size: 512,
          forceStatic: true // Ensures animated avatars work
        }),
        background: {
          image: config.welcomeBackground,
          blur: config.welcomeBackgroundBlur || 0,
          overlay: config.welcomeOverlay || 'rgba(0, 0, 0, 0.5)',
          color: config.welcomeColor || '#5865F2' // Fallback color
        },
        title: config.welcomeTitle?.replace('{server}', member.guild.name) 
               || `WELCOME TO ${member.guild.name.toUpperCase()}`,
        message: config.welcomeMessage?.replace('{count}', member.guild.memberCount + ordinalSuffix)
                 || `You're our ${member.guild.memberCount}${ordinalSuffix} member!`,
        color: config.welcomeColor || '#5865F2',
        textColor: config.welcomeTextColor || '#FFFFFF',
        avatarBorderColor: config.avatarBorderColor || '#FF9900',
        width: config.welcomeWidth || 1600,
        height: config.welcomeHeight || 800,
        font: config.welcomeFont || 'Arial'
      });

      const welcomeMessage = config.welcomePing 
        ? `${member.user}, ${config.welcomePingMessage || 'Welcome to the server!'}`
        : config.welcomePingMessage || '';

      await welcomeChannel.send({
        content: welcomeMessage,
        files: [{
          attachment: buffer,
          name: 'welcome.png'
        }],
        allowedMentions: { users: [member.id] }
      });

    } catch (error) {
      console.error('Welcome image generation failed:', error);
      // Fallback to simple text welcome
      const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannelId);
      if (welcomeChannel) {
        await welcomeChannel.send(
          `${member.user} just joined! ${config.welcomePingMessage || 'Welcome!'}`
        );
      }
    }
  }
};