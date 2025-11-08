const supabase = require('../config/supabase');
const { calculateLevel } = require('../utils/xpCalculator');

// Check and award achievements based on user activity
async function checkAchievements(userId, activityType, activityData = {}) {
  const achievements = [];

  try {
    // Get user's current progress stats
    const { data: progressData } = await supabase
      .from('progress')
      .select('id, tanggal, catatan, gambar, tags')
      .eq('user_id', userId);

    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    const unlockedAchievementIds = new Set(
      userAchievements?.map(ua => ua.achievement_id) || []
    );

    // Get all achievements
    const { data: allAchievements } = await supabase
      .from('achievements')
      .select('*');

    // Check each achievement
    for (const achievement of allAchievements || []) {
      if (unlockedAchievementIds.has(achievement.id)) {
        continue; // Already unlocked
      }

      let shouldUnlock = false;

      switch (achievement.name) {
        case 'First Step':
          shouldUnlock = progressData && progressData.length >= 1;
          break;

        case 'Week Warrior':
          shouldUnlock = checkStreak(progressData, 7);
          break;

        case 'Century':
          shouldUnlock = progressData && progressData.length >= 100;
          break;

        case 'Early Bird':
          shouldUnlock = checkEarlyBird(progressData);
          break;

        case 'Night Owl':
          shouldUnlock = checkNightOwl(progressData);
          break;

        case 'Storyteller':
          const totalWords = progressData?.reduce((sum, p) => {
            return sum + (p.catatan ? p.catatan.split(/\s+/).length : 0);
          }, 0) || 0;
          shouldUnlock = totalWords >= 1000;
          break;

        case 'Photographer':
          const totalImages = progressData?.reduce((sum, p) => {
            return sum + (p.gambar ? p.gambar.length : 0);
          }, 0) || 0;
          shouldUnlock = totalImages >= 50;
          break;

        case 'Consistent':
          shouldUnlock = checkStreak(progressData, 30);
          break;

        case 'Social Butterfly':
          // Check shared progress count
          const { data: sharedData } = await supabase
            .from('shared_progress')
            .select('id')
            .eq('shared_by', userId);
          shouldUnlock = sharedData && sharedData.length >= 10;
          break;

        case 'Team Player':
          // Check if user is in any team
          const { data: teamData } = await supabase
            .from('team_members')
            .select('id')
            .eq('user_id', userId);
          shouldUnlock = teamData && teamData.length >= 1;
          break;

        case 'Commenter':
          const { data: commentData } = await supabase
            .from('comments')
            .select('id')
            .eq('user_id', userId);
          shouldUnlock = commentData && commentData.length >= 20;
          break;

        case 'Reaction Master':
          const { data: reactionData } = await supabase
            .from('reactions')
            .select('id')
            .eq('user_id', userId);
          shouldUnlock = reactionData && reactionData.length >= 50;
          break;
      }

      if (shouldUnlock) {
        // Unlock achievement
        await supabase
          .from('user_achievements')
          .insert([{
            user_id: userId,
            achievement_id: achievement.id,
            progress: 100
          }]);

        // Award XP
        await awardXP(userId, achievement.xp_reward);

        achievements.push(achievement);
      }
    }

    return achievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

// Award XP to user
async function awardXP(userId, xpAmount) {
  try {
    // Get current profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp_points')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      // Create profile if doesn't exist
      await supabase
        .from('profiles')
        .insert([{
          user_id: userId,
          xp_points: xpAmount,
          level: calculateLevel(xpAmount)
        }]);
      return;
    }

    const newXP = (profile.xp_points || 0) + xpAmount;
    const newLevel = calculateLevel(newXP);

    await supabase
      .from('profiles')
      .update({
        xp_points: newXP,
        level: newLevel
      })
      .eq('user_id', userId);

    return { xp: newXP, level: newLevel };
  } catch (error) {
    console.error('Error awarding XP:', error);
    throw error;
  }
}

// Helper functions
function checkStreak(progressData, days) {
  if (!progressData || progressData.length < days) return false;

  const dates = [...new Set(progressData.map(p => p.tanggal))].sort();
  let currentStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      if (currentStreak >= days) return true;
    } else {
      currentStreak = 1;
    }
  }

  return currentStreak >= days;
}

function checkEarlyBird(progressData) {
  if (!progressData) return false;
  return progressData.some(p => {
    const date = new Date(p.dibuat);
    return date.getHours() < 8;
  });
}

function checkNightOwl(progressData) {
  if (!progressData) return false;
  return progressData.some(p => {
    const date = new Date(p.dibuat);
    return date.getHours() >= 22;
  });
}

module.exports = {
  checkAchievements,
  awardXP
};

