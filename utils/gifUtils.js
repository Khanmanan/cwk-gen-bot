const fs = require('fs');
const { temporaryFile } = require('tmp');

module.exports = {
  async sendGifOrFallback(channel, buffer, text) {
    try {
      const tempPath = temporaryFile({ extension: 'gif' });
      fs.writeFileSync(tempPath, buffer);
      
      await channel.send({
        content: text,
        files: [{
          attachment: tempPath,
          name: 'welcome.gif'
        }]
      });
      
      fs.unlinkSync(tempPath);
    } catch (error) {
      console.error('Failed to send GIF:', error);
      await channel.send(text || 'Welcome to the server!');
    }
  }
};