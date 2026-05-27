const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for pin images
const pinStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'pinvault/pins',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto:good' }],
  },
});

// Storage for avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'pinvault/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto:good' }],
  },
});

const pinUpload   = multer({ storage: pinStorage,    limits: { fileSize: 20 * 1024 * 1024 } });
const avatarUpload = multer({ storage: avatarStorage, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = { cloudinary, pinUpload, avatarUpload };
