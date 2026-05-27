const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJWT();

  const cookieOptions = {
    expires:  new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({ success: true, token, user });
};

// ─── @route  POST /api/auth/register ─────────────────────────────────────────
exports.register = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, username, email and password');
  }

  const user = await User.create({ name, username, email, password });
  sendTokenResponse(user, 201, res);
});

// ─── @route  POST /api/auth/login ────────────────────────────────────────────
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.active) {
    res.status(403);
    throw new Error('Account has been deactivated');
  }

  sendTokenResponse(user, 200, res);
});

// ─── @route  POST /api/auth/logout ───────────────────────────────────────────
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.json({ success: true, message: 'Logged out successfully' });
});

// ─── @route  GET  /api/auth/me ────────────────────────────────────────────────
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('followers', 'name username avatar')
    .populate('following', 'name username avatar');
  res.json({ success: true, user });
});

// ─── @route  PUT  /api/auth/updateprofile ────────────────────────────────────
exports.updateProfile = asyncHandler(async (req, res) => {
  const fields = ['name', 'username', 'bio', 'website', 'location'];
  const updates = {};
  fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
  res.json({ success: true, user });
});

// ─── @route  PUT  /api/auth/updatepassword ───────────────────────────────────
exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

// ─── @route  PUT  /api/auth/avatar ───────────────────────────────────────────
exports.updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No image uploaded'); }

  const { path: url, filename: publicId } = req.file;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: { url, publicId } },
    { new: true }
  );
  res.json({ success: true, user });
});
