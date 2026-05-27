const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    username: {
      type:      String,
      required:  [true, 'Username is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match:     [/^[a-z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select:    false,
    },
    avatar: {
      url:      { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    bio: {
      type:      String,
      maxlength: [200, 'Bio cannot exceed 200 characters'],
      default:   '',
    },
    website: { type: String, default: '' },
    location: { type: String, default: '' },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    savedPins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pin' }],
    role:  { type: String, enum: ['user', 'admin'], default: 'user' },
    active:{ type: Boolean, default: true },
    resetPasswordToken:   String,
    resetPasswordExpire:  Date,
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// Virtuals
userSchema.virtual('followerCount').get(function () { return this.followers.length; });
userSchema.virtual('followingCount').get(function () { return this.following.length; });
userSchema.virtual('pins', { ref: 'Pin', localField: '_id', foreignField: 'author', justOne: false });
userSchema.virtual('boards', { ref: 'Board', localField: '_id', foreignField: 'owner', justOne: false });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare entered password to hashed
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Generate signed JWT
userSchema.methods.getSignedJWT = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
