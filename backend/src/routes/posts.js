const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { aiGenerationLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/', postController.getAll);
router.get('/:slug', postController.getBySlug);
router.get('/:slug/related', postController.getRelatedPosts);

// Protected routes
router.post('/', verifyToken, verifyAdmin, postController.create);
router.post('/generate', verifyToken, verifyAdmin, aiGenerationLimiter, postController.generatePost);
router.get('/queue/:queueId', verifyToken, postController.getGenerationStatus);
router.put('/:id', verifyToken, verifyAdmin, postController.update);
router.delete('/:id', verifyToken, verifyAdmin, postController.delete);

module.exports = router;
