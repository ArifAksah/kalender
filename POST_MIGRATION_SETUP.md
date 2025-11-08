# Post-Migration Setup Guide

Setelah migration database berhasil, ikuti langkah-langkah berikut untuk menjalankan aplikasi dengan semua fitur baru.

## 📋 Checklist Setup

### 1. Install Dependencies

Jalankan di terminal:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

**Dependencies baru yang akan diinstall:**
- Backend: `natural`, `sharp`, `web-push`, `node-cron`
- Frontend: `react-chartjs-2`, `chart.js`, `framer-motion`, `react-dropzone`, `react-image-crop`, `dexie`, `emoji-picker-react`, `react-audio-player`

### 2. Setup Environment Variables

Pastikan file `.env` di root folder memiliki semua variabel yang diperlukan:

```env
# Database (Sudah ada)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
PORT=5000
JWT_SECRET=your-random-secret-key-here

# Email Service (Sudah ada)
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=onboarding@resend.dev
APP_URL=http://localhost:3000

# Push Notifications (Baru - Opsional)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

**Untuk Push Notifications (Opsional):**
Jika ingin menggunakan push notifications, generate VAPID keys:
```bash
npm install -g web-push
web-push generate-vapid-keys
```
Copy public key dan private key ke `.env`

### 3. Verifikasi Database Migration

Pastikan semua tabel sudah dibuat dengan benar. Jalankan query ini di Supabase SQL Editor:

```sql
-- Check semua tabel baru
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'profiles', 'password_reset_tokens', 'achievements', 
    'user_achievements', 'badges', 'user_badges', 'teams', 
    'team_members', 'shared_progress', 'comments', 'reactions',
    'tags', 'progress_tags', 'ai_insights', 'push_subscriptions'
  )
ORDER BY table_name;
```

Pastikan semua 15 tabel muncul dalam hasil.

### 4. Verifikasi Seed Data

Cek apakah achievements dan badges sudah ter-insert:

```sql
-- Check achievements
SELECT COUNT(*) FROM achievements;
-- Should return 12

-- Check badges
SELECT COUNT(*) FROM badges;
-- Should return 8
```

### 5. Start Application

Jalankan aplikasi:

```bash
# Development mode (backend + frontend)
npm run dev

# Atau jalankan terpisah:
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

### 6. Testing Fitur Baru

#### ✅ Profile Management
1. Login ke aplikasi
2. Klik avatar/username di header → akan redirect ke `/profile`
3. Upload avatar, edit bio, ubah preferences
4. Klik "Save Changes"

#### ✅ Password Reset
1. Di halaman login, klik "Forgot password?"
2. Masukkan email
3. Check email untuk reset link
4. Klik link dan reset password

#### ✅ Analytics Dashboard
1. Klik tombol "📊 Analytics" di dashboard
2. Lihat charts, heatmap, trends
3. Ubah periode (daily/weekly/monthly)

#### ✅ Gamification
1. Klik tombol "Achievements" atau buka `/achievements`
2. Lihat XP bar, level, achievements
3. Buat progress entry → dapat XP otomatis
4. Lihat leaderboard

#### ✅ Collaboration
1. Buat progress entry
2. Klik tombol share (jika ada)
3. Buat team (jika ada UI untuk itu)
4. Add comments dan reactions

#### ✅ AI Insights
1. Buat beberapa progress entries dengan catatan
2. Refresh dashboard
3. Lihat AI insight card di dashboard
4. Auto-tagging akan otomatis bekerja saat create progress

#### ✅ Theme System
1. Buka Settings (`/settings`)
2. Pilih tab "Appearance"
3. Pilih theme berbeda (Light, Dark, Midnight, Ocean, Forest, Sunset)
4. Lihat perubahan tema secara real-time

#### ✅ Settings Page
1. Buka `/settings`
2. Test semua tab:
   - General: Ubah timezone
   - Appearance: Pilih theme
   - Data & Privacy: Export data (PDF/Excel/JSON)
   - Account: Reset password, logout

### 7. Troubleshooting

#### Error: Module not found
```bash
# Pastikan semua dependencies terinstall
npm install
cd client && npm install && cd ..
```

#### Error: Cannot connect to database
- Check `SUPABASE_URL` dan `SUPABASE_KEY` di `.env`
- Pastikan Supabase project masih aktif

#### Error: Email tidak terkirim
- Check `RESEND_API_KEY` di `.env`
- Verify API key di Resend dashboard
- Check `FROM_EMAIL` sudah benar

#### Error: Profile tidak muncul
- Pastikan trigger `trigger_create_user_profile` sudah dibuat
- Atau manual create profile untuk user yang sudah ada:
```sql
INSERT INTO profiles (user_id, xp_points, level)
SELECT id, 0, 1 FROM users
ON CONFLICT (user_id) DO NOTHING;
```

#### Error: XP tidak bertambah
- Check apakah `awardXP` dipanggil di progress creation
- Check console log untuk error
- Pastikan profile sudah dibuat untuk user

### 8. Fitur yang Perlu UI Tambahan

Beberapa fitur backend sudah siap tapi perlu UI:
- **Teams Management**: Backend ready, perlu halaman Teams
- **Share Progress**: Backend ready, perlu integrasi di DayViewModal
- **Comments & Reactions**: Backend ready, perlu integrasi di progress view

### 9. Next Steps (Opsional)

1. **Mobile Responsive**: Optimize CSS untuk mobile
2. **Media Enhancements**: Tambah video/audio upload
3. **Advanced Search**: Multi-criteria filtering

### 10. Production Deployment

Sebelum deploy ke production:

1. **Enable RLS** (Row Level Security):
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
-- ... dan tabel lainnya
```

2. **Setup Policies** untuk setiap tabel

3. **Update Environment Variables**:
   - `APP_URL` → production URL
   - `FROM_EMAIL` → verified domain email

4. **Setup VAPID Keys** untuk push notifications

## 🎉 Selamat!

Aplikasi Progress Tracker Anda sekarang memiliki:
- ✅ Profile management dengan avatar
- ✅ Password reset
- ✅ Advanced analytics
- ✅ Gamification system
- ✅ Collaboration features
- ✅ PWA capabilities
- ✅ Multiple themes
- ✅ AI insights
- ✅ Comprehensive settings

Semua fitur utama sudah siap digunakan!

