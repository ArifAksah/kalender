const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');
const webpush = require('web-push');

router.use(authMiddleware);

// VAPID keys should be in environment variables
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || 'your-public-key';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || 'your-private-key';

if (vapidPublicKey !== 'your-public-key') {
  webpush.setVapidDetails(
    'mailto:your-email@example.com',
    vapidPublicKey,
    vapidPrivateKey
  );
}

// Subscribe to push notifications
router.post('/subscribe', async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription) {
      return res.status(400).json({ success: false, message: 'Subscription is required' });
    }

    // Save subscription
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: req.user.id,
        endpoint: subscription.endpoint,
        keys: subscription.keys
      }, {
        onConflict: 'user_id,endpoint'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;

    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', req.user.id)
      .eq('endpoint', endpoint);

    res.json({ success: true, message: 'Unsubscribed' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get VAPID public key
router.get('/vapid-key', (req, res) => {
  res.json({ success: true, publicKey: vapidPublicKey });
});

module.exports = router;

