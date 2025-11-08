const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Share progress with user or team
router.post('/', async (req, res) => {
  try {
    const { progressId, sharedWithUserId, sharedWithTeamId, canEdit } = req.body;

    if (!progressId) {
      return res.status(400).json({ success: false, message: 'Progress ID is required' });
    }

    if (!sharedWithUserId && !sharedWithTeamId) {
      return res.status(400).json({ success: false, message: 'Must specify user or team' });
    }

    // Verify progress belongs to user
    const { data: progress } = await supabase
      .from('progress')
      .select('user_id')
      .eq('id', progressId)
      .single();

    if (!progress || progress.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { data, error } = await supabase
      .from('shared_progress')
      .insert([{
        progress_id: progressId,
        shared_with_user_id: sharedWithUserId || null,
        shared_with_team_id: sharedWithTeamId || null,
        shared_by: req.user.id,
        can_edit: canEdit || false
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Share progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get shared progress (progress shared with user)
router.get('/shared-with-me', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shared_progress')
      .select(`
        *,
        progress:progress_id (*),
        shared_by_user:shared_by (id, username)
      `)
      .eq('shared_with_user_id', req.user.id);

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Get shared progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get progress shared by user
router.get('/shared-by-me', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shared_progress')
      .select(`
        *,
        progress:progress_id (*),
        shared_with_user:shared_with_user_id (id, username)
      `)
      .eq('shared_by', req.user.id);

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Get shared by me error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Unshare progress
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('shared_progress')
      .delete()
      .eq('id', req.params.id)
      .eq('shared_by', req.user.id);

    if (error) throw error;

    res.json({ success: true, message: 'Progress unshared' });
  } catch (error) {
    console.error('Unshare error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

