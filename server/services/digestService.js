const cron = require('node-cron');
const { poolPromise, sql } = require('../config/db');
const { getPersonalizedRecommendations } = require('./recommendationService');
const { summarizeArticle, generateKeyTakeaways, generateWhyItMatters } = require('./aiService');

const generateDigestForUser = async (userId) => {
    try {
        const pool = await poolPromise;
        const digestDate = new Date().toISOString().split('T')[0];
        
        // 1. Check if digest already generated today
        const check = await pool.request()
            .input('userId', sql.INT, userId)
            .input('date', sql.DATE, digestDate)
            .query('SELECT content_json FROM DailyDigests WHERE user_id = @userId AND digest_date = @date');
            
        if (check.recordset.length > 0 && check.recordset[0].content_json) {
            return JSON.parse(check.recordset[0].content_json);
        }
        
        // 2. Generate new digest
        const recommendations = await getPersonalizedRecommendations(userId);
        
        // Prefetch preferences
        const prefsResult = await pool.request()
            .input('userId', sql.INT, userId)
            .query('SELECT category FROM UserPreferences WHERE user_id = @userId');
        const userPrefs = prefsResult.recordset.map(r => r.category);

        const structuredDigest = {
            topStories: [],
            basedOnInterests: [],
            recommended: [],
            otherNews: []
        };
        
        const usedIds = new Set();
        
        for (const art of recommendations) {
            if (usedIds.has(art.id)) continue;
            if (structuredDigest.topStories.length < 2) {
                structuredDigest.topStories.push(art);
            } else if (userPrefs.includes(art.category) && structuredDigest.basedOnInterests.length < 3) {
                structuredDigest.basedOnInterests.push(art);
            } else if (art.score > 2 && structuredDigest.recommended.length < 3) {
                structuredDigest.recommended.push(art);
            } else if (structuredDigest.otherNews.length < 2) {
                structuredDigest.otherNews.push(art);
            }
            usedIds.add(art.id);
        }
        
        const allDigestArticles = [
            ...structuredDigest.topStories,
            ...structuredDigest.basedOnInterests,
            ...structuredDigest.recommended,
            ...structuredDigest.otherNews
        ];
        
        // 3. Ensure AI contents exist for all articles in digest
        for (const art of allDigestArticles) {
            const textToSummarize = art.content || art.description || art.title;
            art.summary = await summarizeArticle(art.id, textToSummarize);
            // Skip pre-generating takeaways and insights to prevent Gemini 20 RPM Limit 429 errors!
            // They will be generated dynamically when the user clicks the article instead.
        }
        
        // 4. Save to DB
        if (check.recordset.length > 0) {
            await pool.request()
                .input('userId', sql.INT, userId)
                .input('date', sql.DATE, digestDate)
                .input('contentJson', sql.NVARCHAR, JSON.stringify(structuredDigest))
                .query('UPDATE DailyDigests SET content_json = @contentJson WHERE user_id = @userId AND digest_date = @date');
        } else {
            await pool.request()
                .input('userId', sql.INT, userId)
                .input('date', sql.DATE, digestDate)
                .input('title', sql.NVARCHAR, `Your Daily Digest - ${digestDate}`)
                .input('contentJson', sql.NVARCHAR, JSON.stringify(structuredDigest))
                .query('INSERT INTO DailyDigests (user_id, digest_date, title, content_json) VALUES (@userId, @date, @title, @contentJson)');
        }
            
        return structuredDigest;
        
    } catch (error) {
        console.error('Error generating digest:', error);
        return { topStories: [], basedOnInterests: [], recommended: [], otherNews: [] };
    }
};

// Schedule job to run every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
    console.log('Running daily digest generation...');
    try {
        const pool = await poolPromise;
        const usersResult = await pool.request().query('SELECT id FROM Users');
        
        for (const row of usersResult.recordset) {
            await generateDigestForUser(row.id);
        }
        console.log('Daily digest generation completed.');
    } catch (err) {
        console.error('Cron job error:', err);
    }
});

module.exports = { generateDigestForUser };

