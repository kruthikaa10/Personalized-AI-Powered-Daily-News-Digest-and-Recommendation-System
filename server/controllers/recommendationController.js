const { getPersonalizedRecommendations } = require('../services/recommendationService');

const getRecommendations = async (req, res) => {
    try {
        const articles = await getPersonalizedRecommendations(req.user.id);
        res.json({ success: true, data: articles });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error fetching recommendations' });
    }
};

module.exports = { getRecommendations };

