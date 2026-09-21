const { poolPromise, sql } = require('../config/db');

const getPersonalizedRecommendations = async (userId) => {
    try {
        const pool = await poolPromise;
        
        // 1. Get user preferences
        const prefsResult = await pool.request()
            .input('userId', sql.INT, userId)
            .query('SELECT category FROM UserPreferences WHERE user_id = @userId');
        const userPrefs = prefsResult.recordset.map(r => r.category);
        
        // 2. Get read history categories
        const historyResult = await pool.request()
            .input('userId', sql.INT, userId)
            .query(`
                SELECT a.category 
                FROM ReadingHistory h 
                JOIN Articles a ON h.article_id = a.id 
                WHERE h.user_id = @userId
            `);
        const readCategories = historyResult.recordset.map(r => r.category);
        
        // 3. Get liked categories
        const likesResult = await pool.request()
            .input('userId', sql.INT, userId)
            .query(`
                SELECT a.category 
                FROM ArticleLikes l 
                JOIN Articles a ON l.article_id = a.id 
                WHERE l.user_id = @userId
            `);
        const likedCategories = likesResult.recordset.map(r => r.category);
        
        // 4. Get bookmarked categories
        const bookmarkedResult = await pool.request()
            .input('userId', sql.INT, userId)
            .query(`
                SELECT a.category 
                FROM Bookmarks b 
                JOIN Articles a ON b.article_id = a.id 
                WHERE b.user_id = @userId
            `);
        const bookmarkedCategories = bookmarkedResult.recordset.map(r => r.category);

        // Fetch recent articles
        const articlesResult = await pool.request()
            .query('SELECT TOP 200 * FROM Articles ORDER BY published_at DESC');
            
        const articles = articlesResult.recordset;
        
        // Calculate reading frequency (category counts)
        const categoryFreq = {};
        readCategories.forEach(c => { categoryFreq[c] = (categoryFreq[c] || 0) + 1; });
        const sortedFreq = Object.entries(categoryFreq).sort((a,b) => b[1] - a[1]).map(e => e[0]);
        const frequentCategories = sortedFreq.slice(0, 3); // top 3 most frequent
        
        // Fetch all read titles to extract user keywords for similarity
        const titlesResult = await pool.request()
            .input('userId', sql.INT, userId)
            .query(`
                SELECT a.title 
                FROM ReadingHistory h 
                JOIN Articles a ON h.article_id = a.id 
                WHERE h.user_id = @userId
            `);
        const readTitles = titlesResult.recordset.map(r => r.title.toLowerCase());
        const userKeywords = new Set();
        readTitles.forEach(t => {
            t.split(/\W+/).filter(w => w.length > 4).forEach(w => userKeywords.add(w));
        });
        
        // Scoring
        const scoredArticles = articles.map(article => {
            let score = 0;
            let reasons = [];
            
            if (userPrefs.includes(article.category)) {
                score += 5;
                reasons.push("Based on your interests");
            }
            if (likedCategories.includes(article.category)) {
                score += 4;
                reasons.push("Similar to liked articles");
            }
            if (bookmarkedCategories.includes(article.category)) {
                score += 4;
                reasons.push("Similar to saved articles");
            }
            if (readCategories.includes(article.category)) {
                score += 3;
                reasons.push("Previously read category");
            }
            if (frequentCategories.includes(article.category)) {
                score += 3;
                reasons.push("Frequently read topic");
            }
            
            // Recent article bonus
            const daysOld = (new Date() - new Date(article.published_at)) / (1000 * 60 * 60 * 24);
            if (daysOld < 2) {
                score += 2;
                reasons.push("Recent news");
            }
            
            // Keyword similarity
            let keywordMatch = false;
            const articleWords = article.title.toLowerCase().split(/\W+/).filter(w => w.length > 4);
            for (let word of articleWords) {
                if (userKeywords.has(word)) {
                    keywordMatch = true;
                    break;
                }
            }
            if (keywordMatch) {
                score += 2;
                reasons.push("Matches your reading keywords");
            }
            
            const reason = reasons.length > 0 ? reasons[0] : "General recommendation";
            return { ...article, score, reason };
        });
        
        // Sort by score descending and return top 30
        scoredArticles.sort((a, b) => b.score - a.score);
        return scoredArticles.slice(0, 30);
        
    } catch (error) {
        console.error('Recommendation Error:', error);
        return [];
    }
};

module.exports = { getPersonalizedRecommendations };

