const natural = require('natural');
const supabase = require('../config/supabase');

// Simple sentiment analysis
function analyzeSentiment(text) {
  if (!text || text.trim().length === 0) {
    return { sentiment: 'neutral', score: 0 };
  }

  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text.toLowerCase());
  
  // Simple positive/negative word lists
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'happy', 'success', 'achieved', 'progress', 'improve', 'better', 'love', 'enjoy', 'wonderful', 'fantastic', 'proud'];
  const negativeWords = ['bad', 'terrible', 'failed', 'disappointed', 'sad', 'difficult', 'struggle', 'problem', 'worried', 'stress', 'hard', 'tired', 'frustrated'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  tokens.forEach(token => {
    if (positiveWords.some(word => token.includes(word))) {
      positiveCount++;
    }
    if (negativeWords.some(word => token.includes(word))) {
      negativeCount++;
    }
  });
  
  const score = positiveCount - negativeCount;
  
  if (score > 2) {
    return { sentiment: 'positive', score: Math.min(score, 5) };
  } else if (score < -2) {
    return { sentiment: 'negative', score: Math.max(score, -5) };
  } else {
    return { sentiment: 'neutral', score: 0 };
  }
}

// Extract tags from text using keyword extraction
function extractTags(text) {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text.toLowerCase());
  
  // Remove common stop words
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'];
  
  const filteredTokens = tokens.filter(token => 
    token.length > 3 && 
    !stopWords.includes(token) &&
    !/^\d+$/.test(token) // Remove pure numbers
  );
  
  // Count frequency
  const frequency = {};
  filteredTokens.forEach(token => {
    frequency[token] = (frequency[token] || 0) + 1;
  });
  
  // Get top keywords
  const sorted = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  
  return sorted;
}

// Generate insights from user's progress data
async function generateInsights(userId) {
  try {
    const { data: progressData } = await supabase
      .from('progress')
      .select('tanggal, catatan, dibuat, mood')
      .eq('user_id', userId)
      .order('tanggal', { ascending: false })
      .limit(100);

    if (!progressData || progressData.length === 0) {
      return {
        type: 'welcome',
        content: {
          message: 'Welcome! Start tracking your progress to get personalized insights.',
          suggestions: ['Add your first progress entry', 'Set a daily reminder', 'Explore the analytics dashboard']
        }
      };
    }

    const insights = [];
    
    // Analyze activity patterns
    const daysOfWeek = {};
    const hoursOfDay = {};
    
    progressData.forEach(entry => {
      const date = new Date(entry.dibuat);
      const dayOfWeek = date.getDay();
      const hour = date.getHours();
      
      daysOfWeek[dayOfWeek] = (daysOfWeek[dayOfWeek] || 0) + 1;
      hoursOfDay[hour] = (hoursOfDay[hour] || 0) + 1;
    });
    
    // Find most active day
    const mostActiveDay = Object.entries(daysOfWeek)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (mostActiveDay) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      insights.push({
        type: 'pattern',
        content: {
          title: 'Most Active Day',
          message: `You're most active on ${dayNames[mostActiveDay[0]]}`,
          data: { day: dayNames[mostActiveDay[0]], count: mostActiveDay[1] }
        }
      });
    }
    
    // Analyze sentiment trends
    const sentiments = progressData
      .filter(p => p.catatan)
      .map(p => analyzeSentiment(p.catatan));
    
    const positiveCount = sentiments.filter(s => s.sentiment === 'positive').length;
    const negativeCount = sentiments.filter(s => s.sentiment === 'negative').length;
    
    if (positiveCount > negativeCount * 2) {
      insights.push({
        type: 'sentiment',
        content: {
          title: 'Positive Trend',
          message: 'Your recent entries show a positive outlook!',
          data: { positive: positiveCount, negative: negativeCount }
        }
      });
    }
    
    // Activity frequency
    const recentEntries = progressData.filter(p => {
      const entryDate = new Date(p.tanggal);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryDate >= weekAgo;
    }).length;
    
    if (recentEntries >= 5) {
      insights.push({
        type: 'activity',
        content: {
          title: 'Consistent Tracker',
          message: `Great job! You've logged ${recentEntries} entries this week.`,
          data: { count: recentEntries }
        }
      });
    } else if (recentEntries === 0) {
      insights.push({
        type: 'reminder',
        content: {
          title: 'Get Back on Track',
          message: "You haven't logged any progress this week. Start tracking again!",
          data: { daysSinceLastEntry: 7 }
        }
      });
    }
    
    return insights.length > 0 ? insights[0] : {
      type: 'general',
      content: {
        message: 'Keep tracking your progress to unlock more insights!',
        suggestions: ['Try adding tags to your entries', 'Share your progress with teams', 'Check out your analytics dashboard']
      }
    };
  } catch (error) {
    console.error('Error generating insights:', error);
    return null;
  }
}

// Auto-tag progress entry
function autoTagProgress(catatan) {
  if (!catatan || catatan.trim().length === 0) {
    return [];
  }

  const tags = extractTags(catatan);
  
  // Map common keywords to predefined tags
  const tagMapping = {
    'work': ['work', 'job', 'office', 'project', 'meeting', 'task'],
    'study': ['study', 'learn', 'course', 'book', 'reading', 'education'],
    'exercise': ['exercise', 'workout', 'gym', 'run', 'fitness', 'sport'],
    'health': ['health', 'doctor', 'medicine', 'wellness', 'diet', 'food'],
    'travel': ['travel', 'trip', 'vacation', 'journey', 'flight'],
    'family': ['family', 'parent', 'child', 'home', 'house'],
    'hobby': ['hobby', 'music', 'art', 'craft', 'game', 'fun']
  };
  
  const detectedTags = [];
  
  tags.forEach(tag => {
    Object.entries(tagMapping).forEach(([category, keywords]) => {
      if (keywords.some(keyword => tag.includes(keyword))) {
        if (!detectedTags.includes(category)) {
          detectedTags.push(category);
        }
      }
    });
  });
  
  // Also include top extracted keywords as tags
  const topKeywords = tags.slice(0, 3);
  detectedTags.push(...topKeywords);
  
  return [...new Set(detectedTags)]; // Remove duplicates
}

module.exports = {
  analyzeSentiment,
  extractTags,
  generateInsights,
  autoTagProgress
};

