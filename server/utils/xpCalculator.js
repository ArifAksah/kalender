// XP calculation utilities

const XP_VALUES = {
  CREATE_PROGRESS: 10,
  ADD_IMAGE: 5,
  ADD_VIDEO: 15,
  ADD_AUDIO: 10,
  ADD_TAGS: 3,
  COMPLETE_STREAK_7: 50,
  COMPLETE_STREAK_30: 200,
  COMPLETE_STREAK_100: 1000,
  SHARE_PROGRESS: 5,
  COMMENT: 2,
  REACTION: 1
};

function calculateLevel(xp) {
  // Level formula: level = floor(sqrt(xp / 100)) + 1
  return Math.floor(Math.sqrt(Math.max(xp, 0) / 100)) + 1;
}

function getXPForNextLevel(currentXP) {
  const currentLevel = calculateLevel(currentXP);
  const nextLevelXP = Math.pow(currentLevel, 2) * 100;
  return nextLevelXP - currentXP;
}

function getXPProgress(currentXP) {
  const currentLevel = calculateLevel(currentXP);
  const currentLevelXP = Math.pow(currentLevel - 1, 2) * 100;
  const nextLevelXP = Math.pow(currentLevel, 2) * 100;
  const progress = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  return Math.min(100, Math.max(0, progress));
}

module.exports = {
  XP_VALUES,
  calculateLevel,
  getXPForNextLevel,
  getXPProgress
};

