const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');
const { checkAchievements, awardXP } = require('../services/gamificationService');
const { calculateLevel, getXPProgress, getXPForNextLevel } = require('../utils/xpCalculator');

router.use(authMiddleware);

// Get user XP and level
router.get('/xp', async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('xp_points, level')
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    const xp = profile?.xp_points || 0;
    const level = profile?.level || calculateLevel(xp);
    const progress = getXPProgress(xp);
    const xpForNextLevel = getXPForNextLevel(xp);

    res.json({
      success: true,
      data: {
        xp,
        level,
        progress,
        xpForNextLevel
      }
    });
  } catch (error) {
    console.error('Get XP error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user achievements
router.get('/achievements', async (req, res) => {
  try {
    const { data: userAchievements, error } = await supabase
      .from('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', req.user.id)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: userAchievements || [] });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all available achievements
router.get('/achievements/all', async (req, res) => {
  try {
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*')
      .order('xp_reward', { ascending: false });

    if (error) throw error;

    // Check which ones are unlocked
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', req.user.id);

    const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);

    const achievementsWithStatus = achievements.map(ach => ({
      ...ach,
      unlocked: unlockedIds.has(ach.id)
    }));

    res.json({ success: true, data: achievementsWithStatus });
  } catch (error) {
    console.error('Get all achievements error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user badges
router.get('/badges', async (req, res) => {
  try {
    const { data: userBadges, error } = await supabase
      .from('user_badges')
      .select('*, badges(*)')
      .eq('user_id', req.user.id)
      .order('earned_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: userBadges || [] });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'xp', limit = 50 } = req.query;

    let orderBy = 'xp_points';
    if (type === 'level') {
      orderBy = 'level';
    }

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        xp_points,
        level,
        user_id,
        users:user_id (username)
      `)
      .order(orderBy, { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    const leaderboard = profiles.map((profile, index) => ({
      rank: index + 1,
      username: profile.users?.username || 'Unknown',
      xp: profile.xp_points || 0,
      level: profile.level || 1
    }));

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check achievements (called after progress creation)
router.post('/check-achievements', async (req, res) => {
  try {
    const { activityType, activityData } = req.body;
    const achievements = await checkAchievements(req.user.id, activityType, activityData);
    
    res.json({ success: true, data: achievements });
  } catch (error) {
    console.error('Check achievements error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

