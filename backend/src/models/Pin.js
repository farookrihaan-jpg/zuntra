const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 500 },
    likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const pinSchema = new mongoose.Schema(
  {
    title: {
      type:      String,
      required:  [true, 'Title is required'],
      trim:      true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type:      String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default:   '',
    },
    image: {
      url:      { type: String, required: true },
      publicId: { type: String, default: '' },
      width:    { type: Number, default: 0 },
      height:   { type: Number, default: 0 },
    },
    author: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    category: {
      type:    String,
      enum:    ['Architecture','Nature','Design','Food','Travel','Fashion','Art','Technology','Minimal','Other'],
      default: 'Other',
    },
    tags: [{ type: String, trim: true, maxlength: 30 }],
    link: { type: String, default: '' },
    saves:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    views:    { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    slug: { type: String, unique: true, sparse: true },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// Indexes for performance
pinSchema.index({ author: 1, createdAt: -1 });
pinSchema.index({ category: 1, createdAt: -1 });
pinSchema.index({ tags: 1 });
pinSchema.index({ title: 'text', description: 'text', tags: 'text' });

pinSchema.virtual('saveCount').get(function () { return this.saves.length; });
pinSchema.virtual('commentCount').get(function () { return this.comments.length; });

module.exports = mongoose.model('Pin', pinSchema);
