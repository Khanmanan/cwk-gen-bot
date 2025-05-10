const mongoose = require('mongoose');
const config = require('../../config.json');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  lastMessage: { type: Date, default: new Date(0) }
});

const User = mongoose.model('User', userSchema);

// Calculate required XP for next level
function getRequiredXP(level) {
  return level * config.levelMultiplier;
}

// Add XP to user
async function addXP(userId) {
  const user = await User.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, xp: 0, level: 1 } },
    { upsert: true, new: true }
  );

  const now = new Date();
  if (now - user.lastMessage < config.xpCooldown) return null;

  user.xp += config.xpPerMessage;
  user.lastMessage = now;

  // Check for level up
  const requiredXP = getRequiredXP(user.level);
  if (user.xp >= requiredXP) {
    user.level += 1;
    user.xp -= requiredXP;
    await user.save();
    return { leveledUp: true, newLevel: user.level };
  }

  await user.save();
  return { leveledUp: false, currentXP: user.xp, requiredXP };
}

// Get user stats
async function getUserStats(userId) {
  const user = await User.findOne({ userId }) || 
    new User({ userId, xp: 0, level: 1 });
  return {
    xp: user.xp,
    level: user.level,
    requiredXP: getRequiredXP(user.level)
  };
}

// Get leaderboard
async function getLeaderboard(limit = 10) {
  return await User.find()
    .sort({ level: -1, xp: -1 })
    .limit(limit)
    .exec();
}

module.exports = { addXP, getUserStats, getLeaderboard };
