const { poolPromise, sql } = require('../config/db');
const { generateDigestForUser } = require('../services/digestService');

const getDigest = async (req, res) => {
    try {
        const pool = await poolPromise;
        const digestDate = new Date().toISOString().split('T')[0];
        
        // This endpoint could theoretically fetch saved digest links, but since we are showing articles,
        // we'll just generate/fetch the personalized list directly for now.
        const articles = await generateDigestForUser(req.user.id);
        
        res.json({ success: true, data: articles });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error fetching digest' });
    }
};

const triggerDigestGeneration = async (req, res) => {
    try {
        await generateDigestForUser(req.user.id);
        res.json({ success: true, message: 'Digest generated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error generating digest' });
    }
};

module.exports = { getDigest, triggerDigestGeneration };

