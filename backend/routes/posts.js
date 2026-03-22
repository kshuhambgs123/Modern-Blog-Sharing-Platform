const router      = require('express').Router();
const Post        = require('../models/Post');
const Comment     = require('../models/Comment');
const verifyToken = require('../middleware/auth');
const multer      = require('multer');
const path        = require('path');
const fs          = require('fs');

// ─── Multer Setup ─────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// ─── UPLOAD IMAGE ─────────────────────────────────────────────────────────────
router.post('/upload', verifyToken, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  return res.status(200).json({ url: '/uploads/' + req.file.filename });
});

// ─── CREATE POST ──────────────────────────────────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, content, photo, categories, tags } = req.body;
    if (!title || !content)
      return res.status(400).json({ message: 'Title and content are required' });

    const newPost = new Post({
      title,
      content,
      photo: photo || '',
      userId: req.userId,
      username: req.username,
      categories: categories || [],
      tags: tags || [],
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── UPDATE POST ──────────────────────────────────────────────────────────────
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.userId.toString() !== req.userId)
      return res.status(403).json({ message: 'You can only update your own posts' });

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE POST ──────────────────────────────────────────────────────────────
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.userId.toString() !== req.userId)
      return res.status(403).json({ message: 'You can only delete your own posts' });

    // Delete the post's image if it exists
    if (post.photo) {
      const imgPath = path.join(__dirname, '..', post.photo);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await Post.findByIdAndDelete(req.params.id);
    // Also delete all comments on this post
    await Comment.deleteMany({ postId: req.params.id });

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET SINGLE POST ──────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('userId', 'username profilePic bio');

    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET ALL / SEARCH POSTS ───────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { search, category, username, page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    let filter = {};

    if (search) {
      filter.$or = [
        { title:    { $regex: search, $options: 'i' } },
        { content:  { $regex: search, $options: 'i' } },
        { tags:     { $regex: search, $options: 'i' } },
        { categories: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) filter.categories = { $in: [category] };
    if (username)  filter.username   = username;

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .populate('userId', 'username profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({ posts, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
