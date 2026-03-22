const router      = require('express').Router();
const Comment     = require('../models/Comment');
const verifyToken = require('../middleware/auth');

// ─── CREATE COMMENT / REPLY ───────────────────────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  try {
    const { postId, content, parentId } = req.body;

    if (!postId || !content)
      return res.status(400).json({ message: 'postId and content are required' });

    let depth = 0;
    if (parentId) {
      const parent = await Comment.findById(parentId);
      if (!parent) return res.status(404).json({ message: 'Parent comment not found' });

      depth = parent.depth + 1;
      if (depth > 4) // depths 0-4 = 5 levels
        return res.status(400).json({ message: 'Maximum reply depth of 5 levels reached' });
    }

    const newComment = new Comment({
      postId,
      userId: req.userId,
      content,
      parentId: parentId || null,
      depth,
    });

    const saved    = await newComment.save();
    const populated = await saved.populate('userId', 'username profilePic');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET ALL COMMENTS FOR A POST (flat, frontend builds tree) ─────────────────
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate('userId', 'username profilePic')
      .sort({ createdAt: 1 });

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE COMMENT (+ cascade children) ─────────────────────────────────────
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.userId.toString() !== req.userId)
      return res.status(403).json({ message: 'You can only delete your own comments' });

    // Recursively collect all child comment IDs and delete them
    const deleteWithChildren = async (parentId) => {
      const children = await Comment.find({ parentId });
      for (const child of children) {
        await deleteWithChildren(child._id);
      }
      await Comment.deleteMany({ parentId });
    };

    await deleteWithChildren(req.params.id);
    await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Comment and replies deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── LIKE / UNLIKE COMMENT ────────────────────────────────────────────────────
router.put('/:id/like', verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const alreadyLiked = comment.likes.includes(req.userId);
    const update = alreadyLiked
      ? { $pull: { likes: req.userId } }
      : { $addToSet: { likes: req.userId } };

    const updated = await Comment.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('userId', 'username profilePic');

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
