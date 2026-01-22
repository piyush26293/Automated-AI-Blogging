const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Public routes
router.get('/', categoryController.getAll);
router.get('/slug/:slug', categoryController.getBySlug);
router.get('/:id', categoryController.getById);

// Protected routes
router.post('/', verifyToken, verifyAdmin, categoryController.create);
router.put('/:id', verifyToken, verifyAdmin, categoryController.update);
router.delete('/:id', verifyToken, verifyAdmin, categoryController.delete);

module.exports = router;
