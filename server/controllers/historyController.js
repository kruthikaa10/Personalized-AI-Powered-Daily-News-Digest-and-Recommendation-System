const { poolPromise, sql } = require('../config/db');

const getHistory = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.INT, req.user.id)
            .query(`
                SELECT a.*, h.read_at 
                FROM ReadingHistory h
                JOIN Articles a ON h.article_id = a.id
                WHERE h.user_id = @userId
                ORDER BY h.read_at DESC
            `);
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const addHistory = async (req, res) => {
    try {
        const { articleId } = req.params;
        const pool = await poolPromise;
        
        // Always insert new record for history to track latest read time, or update existing
        await pool.request()
            .input('userId', sql.INT, req.user.id)
            .input('articleId', sql.INT, articleId)
            .query(`
                IF EXISTS (SELECT * FROM ReadingHistory WHERE user_id = @userId AND article_id = @articleId)
                    UPDATE ReadingHistory SET read_at = GETDATE() WHERE user_id = @userId AND article_id = @articleId
                ELSE
                    INSERT INTO ReadingHistory (user_id, article_id) VALUES (@userId, @articleId)
            `);
            
        res.json({ success: true, message: 'History added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const clearHistory = async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('userId', sql.INT, req.user.id)
            .query('DELETE FROM ReadingHistory WHERE user_id = @userId');
        res.json({ success: true, message: 'History cleared' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getHistory, addHistory, clearHistory };

