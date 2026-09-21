const express = require('express');
const { getNews, getArticle, getTranslation, likeArticle, unlikeArticle, getLikeStatus } = require('../controllers/newsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getNews);
router.get('/:id', protect, getArticle);
router.get('/:id/translation', protect, getTranslation);
router.post('/:articleId/like', protect, likeArticle);
router.delete('/:articleId/like', protect, unlikeArticle);
router.get('/:articleId/like-status', protect, getLikeStatus);

module.exports = router;
