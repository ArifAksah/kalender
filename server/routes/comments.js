const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get comments for progress entry
router.get('/progress/:progressId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        users:user_id (id, username)
      `)
      .eq('progress_id', req.params.progressId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add comment
router.post('/', async (req, res) => {
  try {
    const { progressId, content } = req.body;

    if (!progressId || !content) {
      return res.status(400).json({ success: false, message: 'Progress ID and content are required' });
    }

    // Check if user has access to this progress (owner or shared with)
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

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        progress_id: progressId,
        user_id: req.user.id,
        content
      }])
      .select(`
        *,
        users:user_id (id, username)
      `)
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update comment
router.put('/:id', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const { data, error } = await supabase
      .from('comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, message: 'Comment not found or unauthorized' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete comment
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

