const express = require('express');
const { getBookmarks, addBookmark, removeBookmark } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getBookmarks);
router.post('/:articleId', protect, addBookmark);
router.delete('/:articleId', protect, removeBookmark);

module.exports = router;

