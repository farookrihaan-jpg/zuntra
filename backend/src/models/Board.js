const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Board name is required'],
      trim:      true,
      maxlength: [80, 'Board name cannot exceed 80 characters'],
    },
    description: {
      type:      String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default:   '',
    },
    owner: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    pins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pin' }],
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    coverImage: {
      url:      { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    isPrivate: { type: Boolean, default: false },
    category: {
      type:    String,
      enum:    ['Architecture','Nature','Design','Food','Travel','Fashion','Art','Technology','Minimal','Other',''],
      default: '',
    },
    tags: [{ type: String, trim: true }],
    slug: { type: String, unique: true, sparse: true },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

boardSchema.index({ owner: 1, createdAt: -1 });
boardSchema.index({ name: 'text', description: 'text' });

boardSchema.virtual('pinCount').get(function () { return this.pins.length; });

module.exports = mongoose.model('Board', boardSchema);
