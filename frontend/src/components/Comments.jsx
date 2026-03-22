import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import moment from 'moment';
import { useAuth } from '../context/AuthContext';

const MAX_DEPTH = 4; // 0-indexed max depth (= 5 levels)

function CommentItem({ comment, allComments, onReplyAdded, onDelete, depth = 0 }) {
  const { user } = useAuth();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(comment.likes?.includes(user?._id));
  const [likeCount, setLikeCount] = useState(comment.likes?.length || 0);

  const children = allComments.filter((c) => c.parentId === comment._id);
  const initials = (comment.userId?.username || 'U').slice(0, 2).toUpperCase();
  const canDelete = user && user._id === comment.userId?._id;
  const canReply  = user && comment.depth < MAX_DEPTH;

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post('/api/comments', {
        postId: comment.postId,
        content: replyText.trim(),
        parentId: comment._id,
      }, { withCredentials: true });
      toast.success('Reply posted!');
      setReplyText('');
      setShowReply(false);
      if (onReplyAdded) onReplyAdded(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!user) { toast.error('Login to like comments'); return; }
    try {
      const res = await axios.put(`/api/comments/${comment._id}/like`, {}, { withCredentials: true });
      const isNowLiked = res.data.likes.includes(user._id);
      setLiked(isNowLiked);
      setLikeCount(res.data.likes.length);
    } catch { toast.error('Failed to like comment'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment and all its replies?')) return;
    try {
      await axios.delete(`/api/comments/${comment._id}`, { withCredentials: true });
      toast.success('Comment deleted');
      if (onDelete) onDelete(comment._id);
    } catch { toast.error('Failed to delete comment'); }
  };

  return (
    <div className={`comment-item ${depth > 0 ? 'slide-down' : ''}`} style={{ borderLeft: depth > 0 ? `2px solid var(--accent)` : undefined, marginLeft: 0 }}>
      <div className="comment-header">
        <div className="comment-author">
          <div className="depth-indicator">
            {Array.from({ length: depth }).map((_, i) => <span key={i} className="depth-dot" />)}
          </div>
          {comment.userId?.profilePic ? (
            <img src={comment.userId.profilePic} alt={comment.userId.username} className="avatar avatar-sm" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div className="avatar avatar-sm" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>{initials}</div>
          )}
          <strong>{comment.userId?.username || 'Unknown'}</strong>
          {comment.depth > 0 && <span className="badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>Level {comment.depth + 1}</span>}
        </div>
        <span className="comment-time">{moment(comment.createdAt).fromNow()}</span>
      </div>

      <p className="comment-content">{comment.content}</p>

      <div className="comment-actions">
        <button
          className={`comment-action-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          title="Like"
        >
          {liked ? '❤️' : '🤍'} {likeCount > 0 && likeCount}
        </button>
        {canReply && (
          <button className="comment-action-btn" onClick={() => setShowReply((v) => !v)}>
            💬 Reply
          </button>
        )}
        {!canReply && comment.depth >= MAX_DEPTH && (
          <span className="comment-action-btn" style={{ cursor: 'default', opacity: 0.5 }} title="Max depth reached">
            🔒 Max replies
          </span>
        )}
        {canDelete && (
          <button className="comment-action-btn" onClick={handleDelete} style={{ color: 'var(--danger)' }}>
            🗑 Delete
          </button>
        )}
      </div>

      {showReply && (
        <form className="comment-input-box slide-down" onSubmit={handleReply}>
          <textarea
            className="form-input"
            rows={2}
            placeholder={`Reply to ${comment.userId?.username}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            required
            style={{ minHeight: 64, marginBottom: '0.5rem' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowReply(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? 'Posting…' : 'Post Reply'}
            </button>
          </div>
        </form>
      )}

      {/* Nested replies */}
      {children.length > 0 && (
        <div className="comment-replies">
          {children.map((child) => (
            <CommentItem
              key={child._id}
              comment={child}
              allComments={allComments}
              onReplyAdded={onReplyAdded}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Comments({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useState(() => {
    const loadComments = async () => {
      try {
        const res = await axios.get(`/api/comments/post/${postId}`);
        setComments(res.data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    if (postId) loadComments();
  });

  // Actually load when component mounts - fix by using useEffect pattern
  const [loaded, setLoaded] = useState(false);
  if (!loaded && postId) {
    setLoaded(true);
    axios.get(`/api/comments/post/${postId}`)
      .then((res) => setComments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post('/api/comments', {
        postId, content: newComment.trim(), parentId: null,
      }, { withCredentials: true });
      setComments((prev) => [...prev, res.data]);
      setNewComment('');
      toast.success('Comment posted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally { setSubmitting(false); }
  };

  const handleReplyAdded = (newReply) => { setComments((prev) => [...prev, newReply]); };
  const handleDelete = (deletedId) => {
    // Remove deleted comment and all its children recursively
    const toDelete = new Set();
    const collect = (id) => {
      toDelete.add(id);
      comments.filter((c) => c.parentId === id).forEach((c) => collect(c._id));
    };
    collect(deletedId);
    setComments((prev) => prev.filter((c) => !toDelete.has(c._id)));
  };

  const topLevel = comments.filter((c) => c.parentId === null);

  return (
    <section className="comments-section">
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem' }}>
        💬 {comments.length} Comment{comments.length !== 1 ? 's' : ''}
      </h2>

      {/* New comment form */}
      {user ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div className="avatar avatar-sm" style={{ width: 36, height: 36, fontSize: '0.85rem', flexShrink: 0 }}>
                {user.username?.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <textarea
                  className="form-input"
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  style={{ minHeight: 80, marginBottom: '0.75rem' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !newComment.trim()}>
                    {submitting ? 'Posting…' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center', marginBottom: '2rem', color: 'var(--text2)' }}>
          <a href="/login" style={{ color: 'var(--accent2)', fontWeight: 600 }}>Login</a> to join the conversation
        </div>
      )}

      {/* Comments tree */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : topLevel.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <h3>No comments yet</h3>
          <p>Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="comment-tree">
          {topLevel.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              allComments={comments}
              onReplyAdded={handleReplyAdded}
              onDelete={handleDelete}
              depth={0}
            />
          ))}
        </div>
      )}
    </section>
  );
}
