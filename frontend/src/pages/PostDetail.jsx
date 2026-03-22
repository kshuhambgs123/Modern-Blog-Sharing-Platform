import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import moment from 'moment';
import { useAuth } from '../context/AuthContext';
import Comments from '../components/Comments';

export default function PostDetail() {
  const { id } = useParams();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/posts/${id}`);
        setPost(res.data);
      } catch {
        toast.error('Post not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, navigate]);

  const isOwner = user && post && user._id === (post.userId?._id || post.userId);
  const isBookmarked = user?.bookmarks?.includes(post?._id);

  const handleBookmark = async () => {
    if (!user) { toast.error('Please login to bookmark'); navigate('/login'); return; }
    try {
      const res = await axios.put(`/api/users/${user._id}/bookmark/${post._id}`, {}, { withCredentials: true });
      setUser((prev) => ({
        ...prev,
        bookmarks: res.data.bookmarked
          ? [...(prev.bookmarks || []), post._id]
          : (prev.bookmarks || []).filter((id) => id !== post._id),
      }));
      toast.success(res.data.message);
    } catch { toast.error('Failed to update bookmark'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/api/posts/${id}`, { withCredentials: true });
      toast.success('Post deleted');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return <div className="loading-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
  if (!post)   return null;

  return (
    <article className="post-detail fade-in">
      {/* Post header */}
      <div style={{ marginBottom: '1.5rem' }}>
        {post.categories?.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {post.categories.map((cat) => (
              <Link key={cat} to={`/?category=${cat}`} className="badge">{cat}</Link>
            ))}
          </div>
        )}

        <h1 className="post-title">{post.title}</h1>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem', marginBottom: '1.5rem' }}>
          <Link to={`/profile/${post.userId?._id || post.userId}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {post.userId?.profilePic ? (
              <img src={post.userId.profilePic} alt={post.username} className="avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div className="avatar avatar-md">{(post.username || 'U').slice(0, 2).toUpperCase()}</div>
            )}
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{post.username}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{moment(post.createdAt).format('MMMM D, YYYY')}</p>
            </div>
          </Link>

          <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>👁 {post.views} views</span>

            <button
              className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
              onClick={handleBookmark}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
              style={{ fontSize: '1.2rem', padding: '0.5rem' }}
            >
              {isBookmarked ? '🔖' : '🔖'}
            </button>

            {isOwner && (
              <>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/edit/${id}`)}>
                  ✏️ Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteModal(true)}>
                  🗑 Delete
                </button>
              </>
            )}
          </div>
        </div>

        <div className="divider" />
      </div>

      {/* Featured image */}
      {post.photo && (
        <img src={post.photo} alt={post.title} className="post-hero-img" />
      )}

      {/* Post body */}
      <div
        className="post-body"
        dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
      />

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '2rem', padding: '1.5rem', background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text3)', marginRight: '0.25rem' }}>🏷 Tags:</span>
          {post.tags.map((tag) => (
            <Link key={tag} to={`/search?q=${tag}`} className="badge badge-blue">#{tag}</Link>
          ))}
        </div>
      )}

      <div className="divider" style={{ marginTop: '2.5rem' }} />

      {/* Comments */}
      <Comments postId={id} />

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">🗑 Delete Post?</h2>
            <p className="modal-desc">
              This will permanently delete "<strong>{post.title}</strong>" and all its comments. This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
