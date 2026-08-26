const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../../config/cloudinary');
const { authenticate } = require('../../middleware/auth.middleware');

const router = express.Router();

// ------------------------------------------------------------------
// Cloudinary storage — files go directly to Cloudinary, never to disk
// ------------------------------------------------------------------
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Determine resource type (pdf needs 'raw', images use 'image')
    const isPdf = file.mimetype === 'application/pdf';
    return {
      folder: 'enterprise/payment-proofs',
      resource_type: isPdf ? 'raw' : 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      // Keep a clean, unique filename in Cloudinary
      public_id: `proof-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    };
  },
});

// File format filter (extra safety layer before reaching Cloudinary)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPG, JPEG, PNG) and PDFs are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

// ------------------------------------------------------------------
// POST /api/v1/upload
// ------------------------------------------------------------------
router.post('/', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // multer-storage-cloudinary attaches the Cloudinary URL to req.file.path
    const fileUrl = req.file.path;

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully to Cloudinary',
      url: fileUrl,
      // Extra metadata that may be useful on the frontend
      public_id: req.file.filename,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'File upload failed',
    });
  }
});

// ------------------------------------------------------------------
// DELETE /api/v1/upload/:publicId  (optional — for future use)
// Allows deleting a file from Cloudinary by its public_id
// ------------------------------------------------------------------
router.delete('/:publicId', authenticate, async (req, res) => {
  try {
    const { publicId } = req.params;
    // Decode URI-encoded slashes (e.g. "longowal%2Fpayment-proofs%2Fproof-xxx")
    const decodedId = decodeURIComponent(publicId);

    const result = await cloudinary.uploader.destroy(decodedId);

    if (result.result === 'ok' || result.result === 'not found') {
      return res.status(200).json({
        success: true,
        message: 'File removed from Cloudinary',
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Could not delete file from Cloudinary',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Delete failed',
    });
  }
});

module.exports = router;
