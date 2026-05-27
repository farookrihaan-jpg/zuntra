const express = require('express');
const router  = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const {
  getBoards, getBoard, createBoard, updateBoard, deleteBoard,
  addPinToBoard, removePinFromBoard,
} = require('../controllers/boardController');

router.get('/',                           optionalAuth, getBoards);
router.get('/:id',                        optionalAuth, getBoard);
router.post('/',                          protect, createBoard);
router.put('/:id',                        protect, updateBoard);
router.delete('/:id',                     protect, deleteBoard);
router.post('/:id/pins',                  protect, addPinToBoard);
router.delete('/:id/pins/:pinId',         protect, removePinFromBoard);

module.exports = router;
