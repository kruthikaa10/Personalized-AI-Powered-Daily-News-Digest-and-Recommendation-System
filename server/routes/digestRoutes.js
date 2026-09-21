const express = require('express');
const { getDigest, triggerDigestGeneration } = require('../controllers/digestController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getDigest);
router.post('/generate', protect, triggerDigestGeneration);

module.exports = router;

