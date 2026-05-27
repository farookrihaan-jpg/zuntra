const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Pin  = require('../models/Pin');

// ─── GET /api/users/:username ─────────────────────────────────────────────────
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username })
    .populate('followers', 'name username avatar')
    .populate('following', 'name username avatar');

  if (!user) { res.status(404); throw new Error('User not found'); }

  const isFollowing = req.user ? user.followers.some(f => f._id.toString() === req.user.id) : false;
  res.json({ success: true, data: { ...user.toJSON(), isFollowing } });
});

// ─── GET /api/users/:username/pins ────────────────────────────────────────────
exports.getUserPins = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) { res.status(404); throw new Error('User not found'); }

  const { page = 1, limit = 20 } = req.query;
  const skip  = (page - 1) * limit;
  const total = await Pin.countDocuments({ author: user._id });
  const pins  = await Pin.find({ author: user._id })
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit))
    .populate('author', 'name username avatar')
    .lean();

  res.json({ success: true, count: pins.length, total, data: pins });
});

// ─── POST /api/users/:id/follow ───────────────────────────────────────────────
exports.toggleFollow = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    res.status(400); throw new Error('Cannot follow yourself');
  }

  const target = await User.findById(req.params.id);
  if (!target) { res.status(404); throw new Error('User not found'); }

  const isFollowing = target.followers.includes(req.user.id);

  if (isFollowing) {
    target.followers.pull(req.user.id);
    await User.findByIdAndUpdate(req.user.id, { $pull: { following: target._id } });
  } else {
    target.followers.addToSet(req.user.id);
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { following: target._id } });
  }

  await target.save();
  res.json({ success: true, isFollowing: !isFollowing, followerCount: target.followers.length });
});

// ─── GET /api/users ───────────────────────────────────────────────────────────
exports.searchUsers = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  const query = q ? { $or: [{ name: new RegExp(q, 'i') }, { username: new RegExp(q, 'i') }] } : {};

  const skip  = (page - 1) * limit;
  const total = await User.countDocuments(query);
  const users = await User.find(query).skip(skip).limit(Number(limit)).lean();

  res.json({ success: true, count: users.length, total, data: users });
});
