const express = require('express');
const router  = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const { pinUpload } = require('../config/cloudinary');
const {
  getPins, getPin, createPin, updatePin, deletePin,
  toggleSave, addComment, deleteComment, getRelatedPins,
} = require('../controllers/pinController');

router.get('/',                       optionalAuth, getPins);
router.get('/related/:id',            optionalAuth, getRelatedPins);
router.get('/:id',                    optionalAuth, getPin);
router.post('/',                      protect, pinUpload.single('image'), createPin);
router.put('/:id',                    protect, updatePin);
router.delete('/:id',                 protect, deletePin);
router.post('/:id/save',              protect, toggleSave);
router.post('/:id/comments',          protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
