const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const cloudinary = require('cloudinary').v2;
const db = require('../config/database');
const imageGeneratorService = require('../services/imageGeneratorService');

// Configuration
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'ai-blog';

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only images and videos are allowed.'));
  },
});

const mediaController = {
  upload: upload.single('file'),

  async uploadFile(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      let url;
      let type = req.file.mimetype.startsWith('video') ? 'video' : 'image';

      // Upload to Cloudinary if configured, otherwise use local
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.USE_LOCAL_STORAGE !== 'true') {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: CLOUDINARY_FOLDER,
          resource_type: type,
        });
        url = result.secure_url;

        // Delete local file after uploading to Cloudinary
        await fs.unlink(req.file.path);
      } else {
        url = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
      }

      // Save to database
      const dbResult = await db.query(
        'INSERT INTO media (url, type, filename, size, uploaded_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [url, type, req.file.originalname, req.file.size, req.user?.id]
      );

      res.status(201).json({ media: dbResult.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async generateImage(req, res, next) {
    try {
      const { topic, prompt } = req.body;

      if (!topic && !prompt) {
        return res.status(400).json({ error: 'Topic or prompt is required' });
      }

      const imageBuffer = await imageGeneratorService.generateBlogFeaturedImage(topic || prompt);

      // Save to local storage
      const uploadDir = path.join(__dirname, '../../uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      const filename = `ai-generated-${Date.now()}.png`;
      const filepath = path.join(uploadDir, filename);
      await fs.writeFile(filepath, imageBuffer);

      let url;

      // Upload to Cloudinary if configured
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.USE_LOCAL_STORAGE !== 'true') {
        const result = await cloudinary.uploader.upload(filepath, {
          folder: CLOUDINARY_FOLDER,
          resource_type: 'image',
        });
        url = result.secure_url;

        // Delete local file
        await fs.unlink(filepath);
      } else {
        url = `${process.env.BASE_URL}/uploads/${filename}`;
      }

      // Save to database
      const dbResult = await db.query(
        'INSERT INTO media (url, type, filename, size) VALUES ($1, $2, $3, $4) RETURNING *',
        [url, 'image', filename, imageBuffer.length]
      );

      res.status(201).json({ media: dbResult.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const { type, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      let query = 'SELECT * FROM media WHERE 1=1';
      const params = [];

      if (type) {
        query += ' AND type = $1';
        params.push(type);
      }

      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      res.json({ media: result.rows });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const result = await db.query('SELECT * FROM media WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Media not found' });
      }

      const media = result.rows[0];

      // Delete from database
      await db.query('DELETE FROM media WHERE id = $1', [id]);

      // Delete from storage
      if (media.url.includes('cloudinary.com')) {
        // Extract public_id from Cloudinary URL and delete
        try {
          const urlParts = media.url.split('/');
          const filename = urlParts[urlParts.length - 1].split('.')[0];
          const publicId = `${CLOUDINARY_FOLDER}/${filename}`;
          
          if (process.env.CLOUDINARY_CLOUD_NAME) {
            await cloudinary.uploader.destroy(publicId, { resource_type: media.type });
          }
        } catch (cloudinaryError) {
          console.error('Error deleting from Cloudinary:', cloudinaryError);
        }
      } else {
        // Delete from local storage
        try {
          const filename = media.url.split('/').pop();
          const filepath = path.join(__dirname, '../../uploads', filename);
          await fs.unlink(filepath);
        } catch (fsError) {
          console.error('Error deleting local file:', fsError);
        }
      }

      res.json({ message: 'Media deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = mediaController;
