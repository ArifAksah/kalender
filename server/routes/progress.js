const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');
const { awardXP, checkAchievements } = require('../services/gamificationService');
const { XP_VALUES } = require('../utils/xpCalculator');
const { autoTagProgress } = require('../services/aiService');
const fs = require('fs');
const path = require('path');

router.use(authMiddleware);

// Get ALL progress (for statistics)
router.get('/all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', req.user.id)
      .order('tanggal', { ascending: true });
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = supabase
      .from('progress')
      .select('*')
      .eq('user_id', req.user.id)
      .order('tanggal', { ascending: true });
    
    if (month && year) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0);
      const endDateStr = `${year}-${String(month).padStart(2, '0')}-${endDate.getDate()}`;
      
      query = query.gte('tanggal', startDate).lte('tanggal', endDateStr);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ success: false, message: 'Progress not found' });
    }
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/date/:date', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('tanggal', req.params.date)
      .eq('user_id', req.user.id)
      .order('dibuat', { ascending: false });
    
    if (error) throw error;
    
    res.json({ success: true, data: data || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', upload.array('gambar', 5), async (req, res) => {
  try {
    const { tanggal, catatan } = req.body;
    
    if (!tanggal) {
      return res.status(400).json({ success: false, message: 'Tanggal is required' });
    }
    
    const gambarPaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    // Calculate XP earned
    let xpEarned = XP_VALUES.CREATE_PROGRESS;
    if (gambarPaths.length > 0) {
      xpEarned += gambarPaths.length * XP_VALUES.ADD_IMAGE;
    }
    
    // Auto-tag if catatan provided
    let autoTags = [];
    if (catatan) {
      autoTags = autoTagProgress(catatan);
    }
    
    const { data, error } = await supabase
      .from('progress')
      .insert([{
        user_id: req.user.id,
        tanggal,
        catatan: catatan || '',
        gambar: gambarPaths,
        tags: autoTags.length > 0 ? autoTags : null,
        dibuat: new Date().toISOString(),
        update: new Date().toISOString(),
        xp_earned: xpEarned
      }])
      .select();
    
    if (error) throw error;
    
    // Award XP
    try {
      await awardXP(req.user.id, xpEarned);
      // Check achievements asynchronously
      checkAchievements(req.user.id, 'CREATE_PROGRESS', { progressId: data[0].id })
        .catch(err => console.error('Error checking achievements:', err));
    } catch (xpError) {
      console.error('Error awarding XP:', xpError);
      // Don't fail the request if XP fails
    }
    
    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', upload.array('gambar', 5), async (req, res) => {
  try {
    const { catatan, removeImages } = req.body;
    
    const { data: existingData, error: fetchError } = await supabase
      .from('progress')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();
    
    if (fetchError) throw fetchError;
    if (!existingData) {
      return res.status(404).json({ success: false, message: 'Progress not found or unauthorized' });
    }
    
    let updatedImages = existingData.gambar || [];
    
    if (removeImages) {
      const imagesToRemove = JSON.parse(removeImages);
      imagesToRemove.forEach(imgPath => {
        const filePath = path.join(__dirname, '../../', imgPath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        updatedImages = updatedImages.filter(img => img !== imgPath);
      });
    }
    
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      updatedImages = [...updatedImages, ...newImages];
    }
    
    const { data, error } = await supabase
      .from('progress')
      .update({
        catatan: catatan !== undefined ? catatan : existingData.catatan,
        gambar: updatedImages,
        update: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select();
    
    if (error) throw error;
    
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { data: existingData, error: fetchError } = await supabase
      .from('progress')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();
    
    if (fetchError) throw fetchError;
    if (!existingData) {
      return res.status(404).json({ success: false, message: 'Progress not found or unauthorized' });
    }
    
    if (existingData.gambar && existingData.gambar.length > 0) {
      existingData.gambar.forEach(imgPath => {
        const filePath = path.join(__dirname, '../../', imgPath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    const { error } = await supabase
      .from('progress')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Progress deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
