const asyncHandler = require('express-async-handler');
const Board = require('../models/Board');
const Pin   = require('../models/Pin');

// ─── GET /api/boards ──────────────────────────────────────────────────────────
exports.getBoards = asyncHandler(async (req, res) => {
  const { owner, page = 1, limit = 20 } = req.query;
  const query = {};
  if (owner) query.owner = owner;

  // Non-owners only see public boards
  if (!req.user || req.user.id !== owner) {
    query.isPrivate = false;
  }

  const skip   = (page - 1) * limit;
  const total  = await Board.countDocuments(query);
  const boards = await Board.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit))
    .populate('owner', 'name username avatar')
    .populate({ path: 'pins', select: 'image title', options: { limit: 4 } })
    .lean();

  res.json({ success: true, count: boards.length, total, data: boards });
});

// ─── GET /api/boards/:id ──────────────────────────────────────────────────────
exports.getBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id)
    .populate('owner', 'name username avatar')
    .populate({
      path:     'pins',
      populate: { path: 'author', select: 'name username avatar' },
    });

  if (!board) { res.status(404); throw new Error('Board not found'); }

  if (board.isPrivate) {
    if (!req.user || req.user.id !== board.owner._id.toString()) {
      res.status(403); throw new Error('This board is private');
    }
  }

  res.json({ success: true, data: board });
});

// ─── POST /api/boards ─────────────────────────────────────────────────────────
exports.createBoard = asyncHandler(async (req, res) => {
  const { name, description, isPrivate, category, tags } = req.body;

  const board = await Board.create({
    name,
    description,
    isPrivate: !!isPrivate,
    category,
    tags,
    owner: req.user.id,
  });

  await board.populate('owner', 'name username avatar');
  res.status(201).json({ success: true, data: board });
});

// ─── PUT /api/boards/:id ──────────────────────────────────────────────────────
exports.updateBoard = asyncHandler(async (req, res) => {
  let board = await Board.findById(req.params.id);
  if (!board) { res.status(404); throw new Error('Board not found'); }
  if (board.owner.toString() !== req.user.id) { res.status(403); throw new Error('Not authorised'); }

  const allowed = ['name', 'description', 'isPrivate', 'category', 'tags'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  board = await Board.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    .populate('owner', 'name username avatar');

  res.json({ success: true, data: board });
});

// ─── DELETE /api/boards/:id ───────────────────────────────────────────────────
exports.deleteBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);
  if (!board) { res.status(404); throw new Error('Board not found'); }
  if (board.owner.toString() !== req.user.id) { res.status(403); throw new Error('Not authorised'); }

  await board.deleteOne();
  res.json({ success: true, message: 'Board deleted' });
});

// ─── POST /api/boards/:id/pins ────────────────────────────────────────────────
exports.addPinToBoard = asyncHandler(async (req, res) => {
  const { pinId } = req.body;
  const board = await Board.findById(req.params.id);
  if (!board) { res.status(404); throw new Error('Board not found'); }

  const isOwnerOrCollaborator =
    board.owner.toString() === req.user.id ||
    board.collaborators.includes(req.user.id);
  if (!isOwnerOrCollaborator) { res.status(403); throw new Error('Not authorised'); }

  const pin = await Pin.findById(pinId);
  if (!pin) { res.status(404); throw new Error('Pin not found'); }

  if (!board.pins.includes(pinId)) {
    board.pins.unshift(pinId);
    if (!board.coverImage.url) {
      board.coverImage = pin.image;
    }
    await board.save();
  }

  res.json({ success: true, data: board });
});

// ─── DELETE /api/boards/:id/pins/:pinId ──────────────────────────────────────
exports.removePinFromBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);
  if (!board) { res.status(404); throw new Error('Board not found'); }
  if (board.owner.toString() !== req.user.id) { res.status(403); throw new Error('Not authorised'); }

  board.pins.pull(req.params.pinId);
  await board.save();
  res.json({ success: true, data: board });
});
