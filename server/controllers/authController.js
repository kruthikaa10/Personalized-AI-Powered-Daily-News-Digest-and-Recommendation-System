const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please add all fields' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.NVARCHAR, email)
            .query('SELECT * FROM Users WHERE email = @email');

        if (result.recordset.length > 0) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.request()
            .input('name', sql.NVARCHAR, name)
            .input('email', sql.NVARCHAR, email)
            .input('password', sql.NVARCHAR, hashedPassword)
            .query('INSERT INTO Users (name, email, password) VALUES (@name, @email, @password)');

        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.NVARCHAR, email)
            .query('SELECT * FROM Users WHERE email = @email');

        const user = result.recordset[0];

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                success: true,
                message: 'Login successful',
                token: generateToken(user.id),
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getProfile = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.INT, req.user.id)
            .query('SELECT id, name, email, preferred_language FROM Users WHERE id = @id');
        
        const prefsResult = await pool.request()
            .input('id', sql.INT, req.user.id)
            .query('SELECT category FROM UserPreferences WHERE user_id = @id');

        const user = result.recordset[0];
        user.interests = prefsResult.recordset.map(r => r.category);

        res.json({ success: true, data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateProfileLanguage = async (req, res) => {
    try {
        const { language } = req.body;
        if (!['en', 'ta', 'hi'].includes(language)) {
            return res.status(400).json({ success: false, message: 'Invalid language' });
        }
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.INT, req.user.id)
            .input('language', sql.NVARCHAR, language)
            .query('UPDATE Users SET preferred_language = @language WHERE id = @id');
            
        res.json({ success: true, message: 'Language updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { registerUser, loginUser, getProfile, updateProfileLanguage };

