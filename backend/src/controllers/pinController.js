const asyncHandler = require('express-async-handler');
const Pin  = require('../models/Pin');
const User = require('../models/User');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const paginatedResponse = (res, data, total, page, limit) =>
  res.json({
    success: true,
    count:   data.length,
    total,
    page:    Number(page),
    pages:   Math.ceil(total / limit),
    data,
  });

// ─── GET /api/pins ─────────────────────────────────────────────────────────────
// Query params: page, limit, category, tags, search, author, sort
exports.getPins = asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 20, category, tags, search, author, sort = '-createdAt',
  } = req.query;

  const query = {};
  if (category) query.category = category;
  if (tags)     query.tags = { $in: tags.split(',').map(t => t.trim()) };
  if (author)   query.author = author;
  if (search)   query.$text = { $search: search };

  const skip  = (page - 1) * limit;
  const total = await Pin.countDocuments(query);
  const pins  = await Pin.find(query)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .populate('author', 'name username avatar')
    .lean();

  // Attach save status for authenticated user
  if (req.user) {
    const saved = new Set(req.user.savedPins.map(id => id.toString()));
    pins.forEach(p => { p.isSaved = saved.has(p._id.toString()); });
  }

  paginatedResponse(res, pins, total, page, limit);
});

// ─── GET /api/pins/:id ────────────────────────────────────────────────────────
exports.getPin = asyncHandler(async (req, res) => {
  const pin = await Pin.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate('author', 'name username avatar bio followerCount')
    .populate('comments.user', 'name username avatar');

  if (!pin) { res.status(404); throw new Error('Pin not found'); }

  const isSaved = req.user ? req.user.savedPins.includes(pin._id) : false;
  res.json({ success: true, data: { ...pin.toJSON(), isSaved } });
});

// ─── POST /api/pins ────────────────────────────────────────────────────────────
exports.createPin = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('Image is required'); }

  const { title, description, category, tags, link } = req.body;

  const pin = await Pin.create({
    title,
    description,
    category,
    link,
    tags:   tags ? JSON.parse(tags) : [],
    author: req.user.id,
    image: {
      url:      req.file.path,
      publicId: req.file.filename,
      width:    req.file.width  || 0,
      height:   req.file.height || 0,
    },
  });

  await pin.populate('author', 'name username avatar');
  res.status(201).json({ success: true, data: pin });
});

// ─── PUT /api/pins/:id ────────────────────────────────────────────────────────
exports.updatePin = asyncHandler(async (req, res) => {
  let pin = await Pin.findById(req.params.id);
  if (!pin) { res.status(404); throw new Error('Pin not found'); }

  if (pin.author.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorised to update this pin');
  }

  const allowed = ['title', 'description', 'category', 'tags', 'link'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  pin = await Pin.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    .populate('author', 'name username avatar');

  res.json({ success: true, data: pin });
});

// ─── DELETE /api/pins/:id ─────────────────────────────────────────────────────
exports.deletePin = asyncHandler(async (req, res) => {
  const pin = await Pin.findById(req.params.id);
  if (!pin) { res.status(404); throw new Error('Pin not found'); }

  if (pin.author.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorised to delete this pin');
  }

  await pin.deleteOne();
  res.json({ success: true, message: 'Pin deleted' });
});

// ─── POST /api/pins/:id/save ──────────────────────────────────────────────────
exports.toggleSave = asyncHandler(async (req, res) => {
  const pin  = await Pin.findById(req.params.id);
  if (!pin) { res.status(404); throw new Error('Pin not found'); }

  const userId  = req.user.id;
  const isSaved = pin.saves.includes(userId);

  if (isSaved) {
    pin.saves.pull(userId);
    await User.findByIdAndUpdate(userId, { $pull: { savedPins: pin._id } });
  } else {
    pin.saves.addToSet(userId);
    await User.findByIdAndUpdate(userId, { $addToSet: { savedPins: pin._id } });
  }

  await pin.save();
  res.json({ success: true, isSaved: !isSaved, saveCount: pin.saves.length });
});

// ─── POST /api/pins/:id/comments ─────────────────────────────────────────────
exports.addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) { res.status(400); throw new Error('Comment content required'); }

  const pin = await Pin.findById(req.params.id);
  if (!pin) { res.status(404); throw new Error('Pin not found'); }

  pin.comments.unshift({ user: req.user.id, content: content.trim() });
  await pin.save();
  await pin.populate('comments.user', 'name username avatar');

  res.status(201).json({ success: true, data: pin.comments[0] });
});

// ─── DELETE /api/pins/:id/comments/:commentId ────────────────────────────────
exports.deleteComment = asyncHandler(async (req, res) => {
  const pin = await Pin.findById(req.params.id);
  if (!pin) { res.status(404); throw new Error('Pin not found'); }

  const comment = pin.comments.id(req.params.commentId);
  if (!comment) { res.status(404); throw new Error('Comment not found'); }

  if (comment.user.toString() !== req.user.id && pin.author.toString() !== req.user.id) {
    res.status(403); throw new Error('Not authorised to delete this comment');
  }

  comment.deleteOne();
  await pin.save();
  res.json({ success: true, message: 'Comment deleted' });
});

// ─── GET /api/pins/related/:id ────────────────────────────────────────────────
exports.getRelatedPins = asyncHandler(async (req, res) => {
  const pin = await Pin.findById(req.params.id).select('category tags author');
  if (!pin) { res.status(404); throw new Error('Pin not found'); }

  const related = await Pin.find({
    _id:      { $ne: pin._id },
    $or: [
      { category: pin.category },
      { tags:     { $in: pin.tags } },
      { author:   pin.author },
    ],
  })
    .limit(12)
    .populate('author', 'name username avatar')
    .lean();

  res.json({ success: true, data: related });
});
