const { generateAnimatedWelcome, generateWelcomeImage } = require('cwk-gen');
const config = require('../../config.json');
const { sendGifOrFallback } = require('../../utils/gifUtils');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    try {
      const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannelId);
      if (!welcomeChannel) {
        console.warn(`Welcome channel not found (ID: ${config.welcomeChannelId})`);
        return;
      }

      // Custom ordinal suffix (1st, 2nd, 3rd)
      const ordinal = ['th', 'st', 'nd', 'rd'][
        (member.guild.memberCount % 100 > 10 && member.guild.memberCount % 100 < 14) ? 
        0 : member.guild.memberCount % 10
      ] || 'th';

      const options = {
        username: member.user.username,
        avatarURL: member.user.displayAvatarURL({ 
          extension: 'png', 
          size: 512,
          forceStatic: true // Ensures consistent frames
        }),
        title: config.welcomeTitle?.replace('{server}', member.guild.name) 
               || `WELCOME TO ${member.guild.name.toUpperCase()}`,
        message: config.welcomeMessage?.replace('{count}', member.guild.memberCount + ordinal)
                 || `You're our ${member.guild.memberCount}${ordinal} member!`,
        color: config.welcomeColor || '#5865F2',
        textColor: config.welcomeTextColor || '#FFFFFF',
        avatarBorderColor: config.avatarBorderColor || '#FF9900',
        width: config.welcomeWidth || 1200,
        height: config.welcomeHeight || 400,
        font: config.welcomeFont || 'Arial',
        // GIF-specific settings
        frames: config.welcomeAnimation?.frames || 15,
        frameDelay: config.welcomeAnimation?.frameDelay || 100,
        quality: config.welcomeAnimation?.quality || 10
      };

      let buffer;
      if (config.welcomeAnimation?.enabled) {
        try {
          buffer = await generateAnimatedWelcome({
            ...options,
            background: "https://cdn.discordapp.com/attachments/1368508967269171210/1371225354005516349/a_49d36b99c9a37e417c17804a14653998.gif?ex=68225ca0&is=68210b20&hm=d152335b04269d098a1258a8151170fe6f91f4ccf0ec7b16c098616b1439b3e9&" 
          });
        } catch (gifError) {
          console.error('GIF generation failed, falling back to static:', gifError);
          buffer = await generateWelcomeImage(options);
        }
      } else {
        buffer = await generateWelcomeImage(options);
      }

      await welcomeChannel.send({
        content: config.welcomePing ? 
          `${member.user}, ${config.welcomePingMessage || 'Welcome to the server!'}` : '',
        files: [{
          attachment: buffer,
          name: config.welcomeAnimation?.enabled ? 'welcome.gif' : 'welcome.png'
        }],
        allowedMentions: { users: [member.id] }
      });

    } catch (error) {
      console.error('Welcome system error:', error);
      // Ultimate fallback
      const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannelId);
      if (welcomeChannel) {
        await welcomeChannel.send(
          `${member.user} just joined! ${config.welcomePingMessage || 'Welcome!'}`
        ).catch(() => {});
      }
    }
  }
};