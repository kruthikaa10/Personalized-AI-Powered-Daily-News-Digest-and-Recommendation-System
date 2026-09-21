const { poolPromise, sql } = require('../config/db');

const getBookmarks = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.INT, req.user.id)
            .query(`
                SELECT a.*, b.id as bookmark_id, s.summary
                FROM Bookmarks b
                JOIN Articles a ON b.article_id = a.id
                LEFT JOIN ArticleSummaries s ON a.id = s.article_id
                WHERE b.user_id = @userId
                ORDER BY b.created_at DESC
            `);
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const addBookmark = async (req, res) => {
    try {
        const { articleId } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('userId', sql.INT, req.user.id)
            .input('articleId', sql.INT, articleId)
            .query('IF NOT EXISTS (SELECT * FROM Bookmarks WHERE user_id = @userId AND article_id = @articleId) INSERT INTO Bookmarks (user_id, article_id) VALUES (@userId, @articleId)');
        res.json({ success: true, message: 'Article bookmarked' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const removeBookmark = async (req, res) => {
    try {
        const { articleId } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('userId', sql.INT, req.user.id)
            .input('articleId', sql.INT, articleId)
            .query('DELETE FROM Bookmarks WHERE user_id = @userId AND article_id = @articleId');
        res.json({ success: true, message: 'Bookmark removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getBookmarks, addBookmark, removeBookmark };

