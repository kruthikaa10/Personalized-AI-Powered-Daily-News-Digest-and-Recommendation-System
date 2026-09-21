const { poolPromise, sql } = require('../config/db');

const getPreferences = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.INT, req.user.id)
            .query('SELECT category FROM UserPreferences WHERE user_id = @userId');
        
        const categories = result.recordset.map(row => row.category);
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const addPreferences = async (req, res) => {
    try {
        const { categories } = req.body; // Expecting an array
        const pool = await poolPromise;
        
        for (const cat of categories) {
            // Check if exists
            const check = await pool.request()
                .input('userId', sql.INT, req.user.id)
                .input('category', sql.NVARCHAR, cat)
                .query('SELECT * FROM UserPreferences WHERE user_id = @userId AND category = @category');
            
            if (check.recordset.length === 0) {
                await pool.request()
                    .input('userId', sql.INT, req.user.id)
                    .input('category', sql.NVARCHAR, cat)
                    .query('INSERT INTO UserPreferences (user_id, category) VALUES (@userId, @category)');
            }
        }
        res.json({ success: true, message: 'Preferences added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updatePreferences = async (req, res) => {
    try {
        const { categories } = req.body;
        const pool = await poolPromise;
        
        // Delete old preferences
        await pool.request()
            .input('userId', sql.INT, req.user.id)
            .query('DELETE FROM UserPreferences WHERE user_id = @userId');
            
        // Insert new
        for (const cat of categories) {
            await pool.request()
                .input('userId', sql.INT, req.user.id)
                .input('category', sql.NVARCHAR, cat)
                .query('INSERT INTO UserPreferences (user_id, category) VALUES (@userId, @category)');
        }
        res.json({ success: true, message: 'Preferences updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deletePreference = async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('userId', sql.INT, req.user.id)
            .input('category', sql.NVARCHAR, req.params.category)
            .query('DELETE FROM UserPreferences WHERE user_id = @userId AND category = @category');
        
        res.json({ success: true, message: 'Preference removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getPreferences, addPreferences, updatePreferences, deletePreference };

