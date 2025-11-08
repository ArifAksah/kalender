const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');
const { upload, processAvatar } = require('../middleware/avatarUpload');
const fs = require('fs');
const path = require('path');

router.use(authMiddleware);

// Get user profile
router.get('/', async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }

    // If no profile exists, create one
    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([{
          user_id: req.user.id,
          xp_points: 0,
          level: 1
        }])
        .select()
        .single();

      if (createError) throw createError;
      return res.json({ success: true, data: newProfile });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update profile
// Use upload middleware only if Content-Type is multipart/form-data
router.put('/', async (req, res, next) => {
  // Only use upload middleware for multipart/form-data requests
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      processAvatar(req, res, next);
    });
  }
  // For JSON requests, skip upload middleware
  next();
}, async (req, res) => {
  try {
    let bodyData = req.body;
    
    // Parse JSON body if Content-Type is application/json
    if (req.headers['content-type']?.includes('application/json')) {
      bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }

    const { bio, timezone, language, theme_preference, photo } = bodyData;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (bio !== undefined) updateData.bio = bio;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (language !== undefined) updateData.language = language;
    if (theme_preference !== undefined) updateData.theme_preference = theme_preference;

    // Handle photo URL from Supabase Storage (priority) or file upload (fallback)
    if (photo !== undefined) {
      // Photo URL from Supabase Storage
      if (photo === null || photo === '') {
        // Remove photo
        updateData.avatar_url = null;
      } else {
        // Set photo URL from Supabase
        updateData.avatar_url = photo;
      }
    } else if (req.file) {
      // Legacy: Handle file upload (local storage)
      // Get existing profile to delete old avatar
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', req.user.id)
        .single();

      // Delete old avatar file if exists (only for local files)
      if (existingProfile?.avatar_url && !existingProfile.avatar_url.startsWith('http')) {
        const oldAvatarPath = path.join(__dirname, '../../', existingProfile.avatar_url);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      updateData.avatar_url = `/uploads/avatars/${req.file.filename}`;
    }

    console.log('Updating profile with data:', updateData);
    console.log('User ID:', req.user.id);

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('Profile updated successfully:', data);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update profile error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get profile by user ID (for public profiles)
router.get('/:userId', async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, avatar_url, bio, level, xp_points')
      .eq('user_id', req.params.userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }
      throw error;
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Get profile by ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

