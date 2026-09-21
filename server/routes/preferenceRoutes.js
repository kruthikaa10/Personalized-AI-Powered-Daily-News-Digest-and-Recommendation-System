const express = require('express');
const { getPreferences, addPreferences, updatePreferences, deletePreference } = require('../controllers/preferenceController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .get(protect, getPreferences)
    .post(protect, addPreferences)
    .put(protect, updatePreferences);

router.delete('/:category', protect, deletePreference);

module.exports = router;

