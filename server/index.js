require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress');
const profileRoutes = require('./routes/profile');
const analyticsRoutes = require('./routes/analytics');
const gamificationRoutes = require('./routes/gamification');
const teamsRoutes = require('./routes/teams');
const sharingRoutes = require('./routes/sharing');
const commentsRoutes = require('./routes/comments');
const reactionsRoutes = require('./routes/reactions');
const notificationsRoutes = require('./routes/notifications');
const insightsRoutes = require('./routes/insights');
const storageRoutes = require('./routes/storage');
const todosRoutes = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/sharing', sharingRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/reactions', reactionsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/todos', todosRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
