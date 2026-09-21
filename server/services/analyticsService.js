const { poolPromise, sql } = require('../config/db');

const getReadingAnalytics = async (userId) => {
    try {
        const pool = await poolPromise;
        
        const stats = {
            totalRead: 0,
            totalBookmarks: 0,
            totalLikes: 0,
            mostReadCategory: 'None',
            secondMostReadCategory: 'None',
            recentActivity: []
        };
        
        // Total Read
        const readResult = await pool.request()
            .input('userId', sql.INT, userId)
            .query('SELECT COUNT(*) as count FROM ReadingHistory WHERE user_id = @userId');
        stats.totalRead = readResult.recordset[0].count;
        
        // Total Bookmarks
        const bookmarkResult = await pool.request()
            .input('userId', sql.INT, userId)
            .query('SELECT COUNT(*) as count FROM Bookmarks WHERE user_id = @userId');
        stats.totalBookmarks = bookmarkResult.recordset[0].count;
        
        // Total Likes
        const likeResult = await pool.request()
            .input('userId', sql.INT, userId)
            .query('SELECT COUNT(*) as count FROM ArticleLikes WHERE user_id = @userId');
        stats.totalLikes = likeResult.recordset[0].count;
        
        // Most Read Categories
        const catResult = await pool.request()
            .input('userId', sql.INT, userId)
            .query(`
                SELECT a.category, COUNT(*) as count 
                FROM ReadingHistory h 
                JOIN Articles a ON h.article_id = a.id 
                WHERE h.user_id = @userId 
                GROUP BY a.category 
                ORDER BY count DESC
            `);
            
        if (catResult.recordset.length > 0) {
            stats.mostReadCategory = catResult.recordset[0].category;
        }
        if (catResult.recordset.length > 1) {
            stats.secondMostReadCategory = catResult.recordset[1].category;
        }
        
        // Recent Activity
        const recentResult = await pool.request()
            .input('userId', sql.INT, userId)
            .query(`
                SELECT TOP 5 a.title, h.read_at 
                FROM ReadingHistory h 
                JOIN Articles a ON h.article_id = a.id 
                WHERE h.user_id = @userId 
                ORDER BY h.read_at DESC
            `);
        stats.recentActivity = recentResult.recordset;
        
        return stats;
    } catch (error) {
        console.error('Analytics Error:', error);
        return null;
    }
};

const getCategoryAnalytics = async (userId) => {
    try {
        const pool = await poolPromise;
        
        const catResult = await pool.request()
            .input('userId', sql.INT, userId)
            .query(`
                SELECT a.category, COUNT(*) as count 
                FROM ReadingHistory h 
                JOIN Articles a ON h.article_id = a.id 
                WHERE h.user_id = @userId 
                GROUP BY a.category 
                ORDER BY count DESC
            `);
            
        return catResult.recordset;
    } catch (error) {
        console.error('Category Analytics Error:', error);
        return [];
    }
};

module.exports = { getReadingAnalytics, getCategoryAnalytics };
