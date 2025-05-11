const mongoose = require('mongoose');
const config = require('../../config.json');

// Improved schema with better defaults
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  xp: { type: Number, default: 0, min: 0 },
  level: { type: Number, default: 1, min: 1 },
  lastMessage: { type: Date, default: new Date(0) },
  totalXP: { type: Number, default: 0 } // Track lifetime XP for better ranking
});

// Add static methods to schema
userSchema.statics.getRequiredXP = function(level) {
  return level * (config.levelMultiplier || 100); // Fallback to 100 if not configured
};

// Instance method to add XP
userSchema.methods.addXP = async function() {
  const now = new Date();
  const cooldown = config.xpCooldown || 60000; // Default 1 minute cooldown
  
  if (now - this.lastMessage < cooldown) {
    return { leveledUp: false, cooldown: true };
  }

  const xpToAdd = config.xpPerMessage || 15; // Default 15 XP per message
  this.xp += xpToAdd;
  this.totalXP += xpToAdd;
  this.lastMessage = now;

  const requiredXP = this.constructor.getRequiredXP(this.level);
  let leveledUp = false;

  if (this.xp >= requiredXP) {
    this.level += 1;
    this.xp -= requiredXP;
    leveledUp = true;
  }

  await this.save();
  return {
    leveledUp,
    newLevel: leveledUp ? this.level : undefined,
    xp: this.xp,
    requiredXP: this.constructor.getRequiredXP(this.level)
  };
};

const User = mongoose.model('User', userSchema);

// Improved XP functions
module.exports = {
  async addXP(userId) {
    try {
      let user = await User.findOne({ userId });
      
      if (!user) {
        user = new User({ userId });
      }

      return await user.addXP();
    } catch (error) {
      console.error('Error adding XP:', error);
      return null;
    }
  },

  async getUserStats(userId) {
    try {
      const user = await User.findOne({ userId }) || 
        new User({ userId });
      
      // Calculate accurate rank based on totalXP (more fair than current XP)
      const rank = await User.countDocuments({ 
        $or: [
          { level: { $gt: user.level } },
          { level: user.level, totalXP: { $gt: user.totalXP } }
        ]
      }) + 1;

      return {
        xp: user.xp,
        level: user.level,
        requiredXP: User.getRequiredXP(user.level),
        rank,
        totalXP: user.totalXP
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        xp: 0,
        level: 1,
        requiredXP: User.getRequiredXP(1),
        rank: 'N/A',
        totalXP: 0
      };
    }
  },

  async getLeaderboard(limit = 10) {
    try {
      return await User.find()
        .sort({ level: -1, totalXP: -1 }) // Sort by level then total XP
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  },

  // New function to fix existing users
  async migrateUsers() {
    await User.updateMany(
      { totalXP: { $exists: false } },
      { $set: { totalXP: "$xp" } }
    );
  }
};