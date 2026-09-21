const express = require('express');
const { getAnalytics, getCategories } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/reading', protect, getAnalytics);
router.get('/categories', protect, getCategories);

module.exports = router;
