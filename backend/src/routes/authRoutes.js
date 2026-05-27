const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { avatarUpload } = require('../config/cloudinary');
const {
  register, login, logout, getMe, updateProfile, updatePassword, updateAvatar,
} = require('../controllers/authController');

router.post('/register',        register);
router.post('/login',           login);
router.post('/logout',          logout);
router.get('/me',               protect, getMe);
router.put('/updateprofile',    protect, updateProfile);
router.put('/updatepassword',   protect, updatePassword);
router.put('/avatar',           protect, avatarUpload.single('avatar'), updateAvatar);

module.exports = router;
