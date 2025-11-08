const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get progress trends over time
router.get('/trends', async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    
    let dateFormat = '%Y-%m';
    if (period === 'week') {
      dateFormat = '%Y-%u'; // Year-week
    } else if (period === 'day') {
      dateFormat = '%Y-%m-%d';
    }

    const { data, error } = await supabase
      .from('progress')
      .select('tanggal, dibuat')
      .eq('user_id', req.user.id)
      .order('tanggal', { ascending: true });

    if (error) throw error;

    // Group by period
    const grouped = {};
    data.forEach(entry => {
      const date = new Date(entry.tanggal);
      let key;
      
      if (period === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'week') {
        const week = getWeekNumber(date);
        key = `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
      } else {
        key = entry.tanggal;
      }
      
      grouped[key] = (grouped[key] || 0) + 1;
    });

    const trends = Object.keys(grouped).sort().map(key => ({
      period: key,
      count: grouped[key]
    }));

    res.json({ success: true, data: trends });
  } catch (error) {
    console.error('Analytics trends error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get time distribution (hour of day, day of week)
router.get('/time-distribution', async (req, res) => {
  try {
    const { type = 'hour' } = req.query; // 'hour' or 'day'

    const { data, error } = await supabase
      .from('progress')
      .select('dibuat')
      .eq('user_id', req.user.id);

    if (error) throw error;

    const distribution = {};
    
    data.forEach(entry => {
      const date = new Date(entry.dibuat);
      let key;
      
      if (type === 'hour') {
        key = date.getHours();
      } else {
        key = date.getDay(); // 0 = Sunday, 6 = Saturday
      }
      
      distribution[key] = (distribution[key] || 0) + 1;
    });

    // Format for chart
    const formatted = Object.keys(distribution).map(key => ({
      label: type === 'hour' ? `${key}:00` : getDayName(parseInt(key)),
      value: distribution[key]
    })).sort((a, b) => {
      if (type === 'hour') {
        return parseInt(a.label) - parseInt(b.label);
      }
      return parseInt(a.label) - parseInt(b.label);
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Time distribution error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get monthly comparison
router.get('/comparison', async (req, res) => {
  try {
    const { months = 3 } = req.query;
    
    const now = new Date();
    const comparisons = [];
    
    for (let i = 0; i < parseInt(months); i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0);
      const endDateStr = `${year}-${String(month).padStart(2, '0')}-${endDate.getDate()}`;
      
      const { data, error } = await supabase
        .from('progress')
        .select('id')
        .eq('user_id', req.user.id)
        .gte('tanggal', startDate)
        .lte('tanggal', endDateStr);
      
      if (error) throw error;
      
      comparisons.push({
        month: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
        count: data.length,
        period: `${year}-${String(month).padStart(2, '0')}`
      });
    }
    
    res.json({ success: true, data: comparisons.reverse() });
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get activity heatmap data (for GitHub-style calendar)
router.get('/heatmap', async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear();
    
    const startDate = `${targetYear}-01-01`;
    const endDate = `${targetYear}-12-31`;
    
    const { data, error } = await supabase
      .from('progress')
      .select('tanggal')
      .eq('user_id', req.user.id)
      .gte('tanggal', startDate)
      .lte('tanggal', endDate);
    
    if (error) throw error;
    
    // Count entries per date
    const heatmap = {};
    data.forEach(entry => {
      heatmap[entry.tanggal] = (heatmap[entry.tanggal] || 0) + 1;
    });
    
    // Format for heatmap component
    const formatted = Object.keys(heatmap).map(date => ({
      date,
      count: heatmap[date],
      level: getActivityLevel(heatmap[date])
    }));
    
    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Heatmap error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get category breakdown (if tags are used)
router.get('/category-breakdown', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('progress')
      .select('tags')
      .eq('user_id', req.user.id)
      .not('tags', 'is', null);
    
    if (error) throw error;
    
    const categoryCount = {};
    
    data.forEach(entry => {
      if (entry.tags && Array.isArray(entry.tags)) {
        entry.tags.forEach(tag => {
          categoryCount[tag] = (categoryCount[tag] || 0) + 1;
        });
      }
    });
    
    const breakdown = Object.keys(categoryCount).map(tag => ({
      name: tag,
      value: categoryCount[tag]
    })).sort((a, b) => b.value - a.value);
    
    res.json({ success: true, data: breakdown });
  } catch (error) {
    console.error('Category breakdown error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get overall statistics
router.get('/stats', async (req, res) => {
  try {
    const { data: allProgress, error: progressError } = await supabase
      .from('progress')
      .select('tanggal, dibuat, catatan, gambar')
      .eq('user_id', req.user.id);
    
    if (progressError) throw progressError;
    
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeek = new Date(now);
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
    thisWeek.setHours(0, 0, 0, 0);
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const stats = {
      total: allProgress.length,
      thisMonth: allProgress.filter(p => new Date(p.tanggal) >= thisMonth).length,
      thisWeek: allProgress.filter(p => new Date(p.tanggal) >= thisWeek).length,
      today: allProgress.filter(p => {
        const pDate = new Date(p.tanggal);
        return pDate.getFullYear() === today.getFullYear() &&
               pDate.getMonth() === today.getMonth() &&
               pDate.getDate() === today.getDate();
      }).length,
      totalWords: allProgress.reduce((sum, p) => {
        return sum + (p.catatan ? p.catatan.split(/\s+/).length : 0);
      }, 0),
      totalImages: allProgress.reduce((sum, p) => {
        return sum + (p.gambar ? p.gambar.length : 0);
      }, 0),
      averagePerDay: calculateAveragePerDay(allProgress),
      longestStreak: calculateLongestStreak(allProgress),
      currentStreak: calculateCurrentStreak(allProgress)
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper functions
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getDayName(dayIndex) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
}

function getActivityLevel(count) {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

function calculateAveragePerDay(progress) {
  if (progress.length === 0) return 0;
  const dates = progress.map(p => new Date(p.tanggal));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  const daysDiff = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;
  return (progress.length / daysDiff).toFixed(2);
}

function calculateLongestStreak(progress) {
  if (progress.length === 0) return 0;
  
  const dates = [...new Set(progress.map(p => p.tanggal))].sort();
  let longestStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return longestStreak;
}

function calculateCurrentStreak(progress) {
  if (progress.length === 0) return 0;
  
  const dates = [...new Set(progress.map(p => p.tanggal))].sort().reverse();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let expectedDate = new Date(today);
  
  for (const dateStr of dates) {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    
    if (date.getTime() === expectedDate.getTime()) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else if (date < expectedDate) {
      break;
    }
  }
  
  return streak;
}

module.exports = router;

