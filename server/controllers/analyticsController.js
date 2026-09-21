const { getReadingAnalytics, getCategoryAnalytics } = require('../services/analyticsService');

const getAnalytics = async (req, res) => {
    try {
        const stats = await getReadingAnalytics(req.user.id);
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await getCategoryAnalytics(req.user.id);
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getAnalytics, getCategories };
