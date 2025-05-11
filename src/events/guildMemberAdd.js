const { generateAnimatedWelcome, generateWelcomeImage } = require('cwk-gen');
const config = require('../../config.json');
const fs = require('fs').promises;
const path = require('path');

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
          forceStatic: true
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
        frames: config.welcomeAnimation?.frames || 15,
        frameDelay: config.welcomeAnimation?.frameDelay || 100,
        quality: config.welcomeAnimation?.quality || 10
      };

      let buffer;
      if (config.welcomeAnimation?.enabled) {
        // Try multiple background sources in sequence
        const backgroundSources = [
          config.welcomeAnimation?.background, // Primary URL from config
          './assets/welcome-bg.gif', // Local fallback 1
          './assets/welcome-bg.png', // Local fallback 2
        ];

        let lastError = null;
        
        for (const background of backgroundSources) {
          if (!background) continue;
          
          try {
            buffer = await generateAnimatedWelcome({
              ...options,
              background: background
            });
            lastError = null;
            break; // Success - exit loop
          } catch (error) {
            lastError = error;
            console.warn(`Failed with background ${background}, trying next option...`);
          }
        }

        // If all animated options failed
        if (lastError) {
          console.error('All animated options failed, falling back to static:', lastError);
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
      // Ultimate fallback - simple text welcome
      try {
        const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannelId);
        if (welcomeChannel) {
          await welcomeChannel.send(
            `${member.user} just joined! ${config.welcomePingMessage || 'Welcome!'}`
          );
        }
      } catch (finalError) {
        console.error('Even the text fallback failed:', finalError);
      }
    }
  }
};