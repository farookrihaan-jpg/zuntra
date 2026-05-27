const express = require('express');
const router  = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const { getProfile, getUserPins, toggleFollow, searchUsers } = require('../controllers/userController');

router.get('/',                    searchUsers);
router.get('/:username',           optionalAuth, getProfile);
router.get('/:username/pins',      optionalAuth, getUserPins);
router.post('/:id/follow',         protect, toggleFollow);

module.exports = router;
