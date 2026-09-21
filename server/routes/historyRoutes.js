const express = require('express');
const { getHistory, addHistory, clearHistory } = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getHistory);
router.post('/:articleId', protect, addHistory);
router.delete('/', protect, clearHistory);

module.exports = router;

