import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the directory exists
const uploadDir = 'uploads/kyc';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Standard format: courier-id-front.jpg
    const userId = (req as any).user?.id || 'unknown';
    const fieldName = file.fieldname; // 'front' or 'back'
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${userId}-${fieldName}${extension}`);
  }
});

// File filter (images only)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extName) {
    return cb(null, true);
  }
  cb(new Error('Only JPG and PNG images are allowed.'));
};

export const kycUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
  fileFilter
});
