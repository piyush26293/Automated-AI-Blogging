const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { aiGenerationLimiter } = require('../middleware/rateLimiter');

router.get('/', mediaController.getAll);
router.post('/upload', verifyToken, verifyAdmin, mediaController.upload, mediaController.uploadFile);
router.post('/generate', verifyToken, verifyAdmin, aiGenerationLimiter, mediaController.generateImage);
router.delete('/:id', verifyToken, verifyAdmin, mediaController.delete);

module.exports = router;
