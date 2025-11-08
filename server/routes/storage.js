const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Configure multer for memory storage (we'll upload directly to Supabase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Test route to verify storage endpoint is accessible
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Storage endpoint is working' });
});

// Upload file to Supabase Storage
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('Upload request received:', {
      hasFile: !!req.file,
      userId: req.body.userId || req.user?.id,
      type: req.body.type
    });

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const file = req.file;
    const userId = req.body.userId || req.user?.id;
    const type = req.body.type || 'general';

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Validate file type
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    
    // Get file extension from filename or mimetype
    let fileExt = 'jpg'; // default extension
    if (file.originalname) {
      const parts = file.originalname.split('.');
      if (parts.length > 1) {
        fileExt = parts.pop().toLowerCase();
      }
    } else if (file.mimetype) {
      // Extract extension from mimetype (e.g., 'image/jpeg' -> 'jpg')
      const mimeParts = file.mimetype.split('/');
      if (mimeParts.length > 1) {
        const mimeType = mimeParts[1];
        if (mimeType === 'jpeg') fileExt = 'jpg';
        else if (mimeType === 'png') fileExt = 'png';
        else if (mimeType === 'gif') fileExt = 'gif';
        else if (mimeType === 'webp') fileExt = 'webp';
      }
    }
    
    const extname = allowedTypes.test(fileExt);
    const mimetype = allowedTypes.test(file.mimetype);

    if (!mimetype || !extname) {
      return res.status(400).json({ 
        success: false, 
        message: 'Only image files are allowed (JPEG, PNG, GIF, WebP)',
        receivedMimeType: file.mimetype,
        receivedExtension: fileExt
      });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'File size must be less than 5MB' });
    }

    // Generate unique filename
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = type === 'profile-photo' 
      ? `profile-photos/${userId}/${fileName}`
      : `${type}/${userId}/${fileName}`;

    // Upload to Supabase Storage
    const bucketName = 'avatars'; // You can change this to your bucket name
    
    // Check if bucket exists, if not provide helpful error
    console.log('Checking buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      console.error('Error details:', JSON.stringify(listError, null, 2));
      console.error('Make sure you are using SUPABASE_SERVICE_ROLE_KEY (not anon key) in .env');
      
      // Try to upload anyway - bucket might exist but listBuckets requires admin access
      console.log('Attempting upload despite listBuckets error...');
    } else {
      console.log('Available buckets:', buckets?.map(b => ({ name: b.name, public: b.public })) || []);
      
      if (buckets && buckets.length > 0) {
        const bucketExists = buckets.some(b => b.name === bucketName);
        if (!bucketExists) {
          const availableNames = buckets.map(b => b.name);
          console.error(`Bucket "${bucketName}" not found. Available buckets:`, availableNames);
          return res.status(500).json({
            success: false,
            message: `Storage bucket "${bucketName}" not found.`,
            availableBuckets: availableNames,
            hint: `Please create bucket named "${bucketName}" or use one of the existing buckets: ${availableNames.join(', ')}`
          });
        } else {
          console.log(`Bucket "${bucketName}" found!`);
        }
      } else {
        console.warn('No buckets found. Bucket might need to be created.');
      }
    }
    
    console.log(`Uploading to bucket "${bucketName}" at path: ${filePath}`);
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.mimetype
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Error status:', error.statusCode);
      console.error('Error name:', error.name);
      
      // Provide more helpful error messages
      let errorMessage = error.message || 'Failed to upload file to storage';
      if (error.message?.includes('Bucket not found') || error.statusCode === 404) {
        errorMessage = `Storage bucket "${bucketName}" not found. Please create it in Supabase Storage dashboard with name exactly "${bucketName}".`;
      } else if (error.message?.includes('new row violates') || error.message?.includes('policy')) {
        errorMessage = 'Storage bucket policy error. Please check bucket permissions in Supabase. Make sure bucket allows INSERT for authenticated users.';
      } else if (error.message?.includes('JWT') || error.message?.includes('Invalid API key')) {
        errorMessage = 'Supabase authentication error. Please check SUPABASE_SERVICE_ROLE_KEY in server .env file (use service_role key, not anon key).';
      } else if (error.message?.includes('duplicate')) {
        errorMessage = 'File already exists. Try again.';
      }
      
      return res.status(500).json({ 
        success: false, 
        message: errorMessage,
        error: error.message,
        statusCode: error.statusCode,
        bucketName: bucketName,
        details: process.env.NODE_ENV === 'development' ? {
          error: error.message,
          statusCode: error.statusCode,
          name: error.name
        } : undefined
      });
    }
    
    console.log('Upload successful!', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    res.json({ 
      success: true, 
      url: urlData.publicUrl,
      path: filePath
    });
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to upload file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete file from Supabase Storage
router.post('/delete', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    // Extract file path from URL
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // Find bucket name and file path
      // Supabase URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
      const bucketIndex = pathParts.indexOf('public') + 1;
      if (bucketIndex === 0 || bucketIndex >= pathParts.length) {
        throw new Error('Invalid Supabase Storage URL');
      }

      const bucketName = pathParts[bucketIndex];
      const filePath = pathParts.slice(bucketIndex + 1).join('/');

      // Delete file from storage
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Supabase Storage delete error:', error);
        // Don't fail if file doesn't exist
        if (!error.message.includes('not found')) {
          return res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to delete file' 
          });
        }
      }

      res.json({ success: true, message: 'File deleted successfully' });
    } catch (parseError) {
      console.error('URL parse error:', parseError);
      // If URL parsing fails, try to extract path manually
      const pathMatch = url.match(/\/storage\/v1\/object\/public\/[^\/]+\/(.+)$/);
      if (pathMatch) {
        const bucketMatch = url.match(/\/storage\/v1\/object\/public\/([^\/]+)\//);
        const bucketName = bucketMatch ? bucketMatch[1] : 'avatars';
        const filePath = pathMatch[1];

        const { error } = await supabase.storage
          .from(bucketName)
          .remove([filePath]);

        if (error && !error.message.includes('not found')) {
          return res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to delete file' 
          });
        }

        return res.json({ success: true, message: 'File deleted successfully' });
      }

      return res.status(400).json({ 
        success: false, 
        message: 'Invalid URL format' 
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

