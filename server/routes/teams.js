const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get all teams user is member of
router.get('/', async (req, res) => {
  try {
    const { data: teams, error } = await supabase
      .from('team_members')
      .select(`
        *,
        teams (*)
      `)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ success: true, data: teams || [] });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create team
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Team name is required' });
    }

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([{
        name,
        description: description || '',
        owner_id: req.user.id
      }])
      .select()
      .single();

    if (teamError) throw teamError;

    // Add creator as owner
    await supabase
      .from('team_members')
      .insert([{
        team_id: team.id,
        user_id: req.user.id,
        role: 'owner'
      }]);

    res.status(201).json({ success: true, data: team });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get team details
router.get('/:id', async (req, res) => {
  try {
    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members (
          *,
          users:user_id (id, username)
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    // Check if user is member
    const isMember = team.team_members.some(m => m.user_id === req.user.id);
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Not a team member' });
    }

    res.json({ success: true, data: team });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add member to team
router.post('/:id/members', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Check if user is owner/admin
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({ success: false, message: 'Only owners/admins can add members' });
    }

    // Add member
    const { data, error } = await supabase
      .from('team_members')
      .insert([{
        team_id: req.params.id,
        user_id: userId,
        role: 'member'
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

