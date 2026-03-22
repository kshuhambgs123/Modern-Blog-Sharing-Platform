const router      = require('express').Router();
const User        = require('../models/User');
const Post        = require('../models/Post');
const bcrypt      = require('bcryptjs');
const verifyToken = require('../middleware/auth');
const multer      = require('multer');
const path        = require('path');
const fs          = require('fs');

// ─── Multer for profile picture ───────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb)  => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── GET USER PROFILE ─────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── UPDATE USER PROFILE ──────────────────────────────────────────────────────
router.put('/:id', verifyToken, upload.single('profilePic'), async (req, res) => {
  try {
    if (req.userId !== req.params.id)
      return res.status(403).json({ message: 'You can only update your own profile' });

    const updates = {};
    const { username, bio } = req.body;
    if (username) updates.username = username;
    if (bio !== undefined) updates.bio = bio;

    if (req.file) updates.profilePic = '/uploads/' + req.file.filename;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── UPLOAD PROFILE PIC ───────────────────────────────────────────────────────
router.post('/upload-pic', verifyToken, upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const url = '/uploads/' + req.file.filename;
    const user = await User.findByIdAndUpdate(req.userId, { profilePic: url }, { new: true }).select('-password');
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET USER'S POSTS ─────────────────────────────────────────────────────────
router.get('/:id/posts', async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── BOOKMARK A POST ──────────────────────────────────────────────────────────
router.put('/:id/bookmark/:postId', verifyToken, async (req, res) => {
  try {
    if (req.userId !== req.params.id)
      return res.status(403).json({ message: 'Unauthorized' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const alreadyBookmarked = user.bookmarks.includes(req.params.postId);
    const update = alreadyBookmarked
      ? { $pull:      { bookmarks: req.params.postId } }
      : { $addToSet:  { bookmarks: req.params.postId } };

    const updated = await User.findByIdAndUpdate(req.params.id, update, { new: true })
      .select('-password');

    res.status(200).json({
      bookmarks: updated.bookmarks,
      bookmarked: !alreadyBookmarked,
      message: alreadyBookmarked ? 'Bookmark removed' : 'Post bookmarked',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET BOOKMARKED POSTS ─────────────────────────────────────────────────────
router.get('/:id/bookmarks', verifyToken, async (req, res) => {
  try {
    if (req.userId !== req.params.id)
      return res.status(403).json({ message: 'Unauthorized' });

    const user = await User.findById(req.params.id).populate({
      path: 'bookmarks',
      populate: { path: 'userId', select: 'username profilePic' },
    }).select('bookmarks');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user.bookmarks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
