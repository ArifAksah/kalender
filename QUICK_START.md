# Quick Start Guide - Setelah Database Migration

## 🚀 Langkah Cepat Setup

### 1. Install Dependencies (WAJIB!)

```bash
# Di root folder
npm install

# Di folder client
cd client
npm install
cd ..
```

### 2. Verifikasi Database

Pastikan migration SQL sudah berhasil dijalankan di Supabase. Check dengan query:

```sql
SELECT COUNT(*) FROM achievements;
-- Harus return 12

SELECT COUNT(*) FROM badges;
-- Harus return 8
```

### 3. Start Aplikasi

```bash
# Development mode (recommended)
npm run dev

# Atau terpisah:
# Terminal 1
npm run server

# Terminal 2  
cd client && npm start
```

### 4. Test Fitur Baru

#### ✅ Profile & Settings
- Login → Klik avatar/username → Profile page
- Upload avatar, edit bio
- Buka Settings → Pilih theme berbeda

#### ✅ Analytics
- Klik tombol "📊 Analytics" di dashboard
- Lihat charts, heatmap, trends

#### ✅ Gamification
- Buat progress entry → Dapat XP otomatis
- Buka `/achievements` → Lihat XP bar, achievements, leaderboard

#### ✅ Collaboration
- Klik progress entry di calendar
- Klik tombol "🔗" untuk share
- Klik "💬 Comments" untuk comment
- Klik emoji reactions (👍❤️😊🎉🔥💯)

#### ✅ AI Insights
- Buat beberapa progress dengan catatan panjang
- Refresh dashboard → Lihat AI insight card muncul
- Auto-tagging bekerja otomatis saat create progress

### 5. Troubleshooting Cepat

**Error: Cannot find module**
```bash
npm install
cd client && npm install
```

**Error: Database connection**
- Check `.env` file
- Pastikan `SUPABASE_URL` dan `SUPABASE_KEY` benar

**Error: Email tidak terkirim**
- Check `RESEND_API_KEY` di `.env`
- Verify di Resend dashboard

**Profile tidak muncul**
- Jalankan query ini di Supabase:
```sql
INSERT INTO profiles (user_id, xp_points, level)
SELECT id, 0, 1 FROM users
ON CONFLICT (user_id) DO NOTHING;
```

## 📱 Fitur yang Sudah Siap

✅ Profile Management  
✅ Password Reset  
✅ Advanced Analytics  
✅ Gamification (XP, Achievements, Badges)  
✅ Collaboration (Share, Comments, Reactions)  
✅ PWA (Install prompt, offline)  
✅ 6 Themes  
✅ AI Insights & Auto-tagging  
✅ Settings Page  

## 🎯 Next Steps

1. Test semua fitur
2. Customize themes jika perlu
3. Setup VAPID keys untuk push notifications (opsional)
4. Deploy ke production

## 📚 Dokumentasi Lengkap

Lihat `POST_MIGRATION_SETUP.md` untuk panduan lengkap!

