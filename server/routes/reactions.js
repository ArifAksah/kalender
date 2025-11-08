const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get reactions for progress entry
router.get('/progress/:progressId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reactions')
      .select(`
        *,
        users:user_id (id, username)
      `)
      .eq('progress_id', req.params.progressId);

    if (error) throw error;

    // Group by reaction type
    const grouped = {};
    data.forEach(reaction => {
      if (!grouped[reaction.reaction_type]) {
        grouped[reaction.reaction_type] = [];
      }
      grouped[reaction.reaction_type].push(reaction);
    });

    res.json({ success: true, data: grouped });
  } catch (error) {
    console.error('Get reactions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add/update reaction
router.post('/', async (req, res) => {
  try {
    const { progressId, reactionType } = req.body;

    if (!progressId || !reactionType) {
      return res.status(400).json({ success: false, message: 'Progress ID and reaction type are required' });
    }

    // Check if user has access
    const { data: progress } = await supabase
      .from('progress')
      .select('user_id')
      .eq('id', progressId)
      .single();

    if (!progress) {
      return res.status(404).json({ success: false, message: 'Progress not found' });
    }

    // Check if shared with user
    const { data: shared } = await supabase
      .from('shared_progress')
      .select('id')
      .eq('progress_id', progressId)
      .eq('shared_with_user_id', req.user.id)
      .single();

    if (progress.user_id !== req.user.id && !shared) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Upsert reaction
    const { data, error } = await supabase
      .from('reactions')
      .upsert({
        progress_id: progressId,
        user_id: req.user.id,
        reaction_type: reactionType
      }, {
        onConflict: 'progress_id,user_id,reaction_type'
      })
      .select(`
        *,
        users:user_id (id, username)
      `)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove reaction
router.delete('/progress/:progressId/reaction/:reactionType', async (req, res) => {
  try {
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('progress_id', req.params.progressId)
      .eq('user_id', req.user.id)
      .eq('reaction_type', req.params.reactionType);

    if (error) throw error;

    res.json({ success: true, message: 'Reaction removed' });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

