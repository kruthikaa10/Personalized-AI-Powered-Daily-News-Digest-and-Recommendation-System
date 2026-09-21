const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const preferenceRoutes = require('./routes/preferenceRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const historyRoutes = require('./routes/historyRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const digestRoutes = require('./routes/digestRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/digest', digestRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

// Import Cron Jobs
require('./services/digestService');

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

