const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');
const { generateInsights, analyzeSentiment, autoTagProgress } = require('../services/aiService');

router.use(authMiddleware);

// Get AI insights for user
router.get('/', async (req, res) => {
  try {
    const insight = await generateInsights(req.user.id);
    
    if (insight) {
      // Save insight to database
      await supabase
        .from('ai_insights')
        .insert([{
          user_id: req.user.id,
          insight_type: insight.type,
          content: insight.content
        }]);
    }
    
    res.json({ success: true, data: insight });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Analyze sentiment of text
router.post('/sentiment', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text is required' });
    }
    
    const sentiment = analyzeSentiment(text);
    res.json({ success: true, data: sentiment });
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Auto-tag text
router.post('/auto-tag', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text is required' });
    }
    
    const tags = autoTagProgress(text);
    res.json({ success: true, data: tags });
  } catch (error) {
    console.error('Auto-tag error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get insight history
router.get('/history', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', req.user.id)
      .order('generated_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Get insight history error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

