const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    default: "",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  categories: {
    type: [String],
    default: [],
  },
  tags: {
    type: [String],
    default: [],
  },
  views: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Text index for full-text search
PostSchema.index({ title: 'text', content: 'text', categories: 'text', tags: 'text' });

module.exports = mongoose.model('Post', PostSchema);
