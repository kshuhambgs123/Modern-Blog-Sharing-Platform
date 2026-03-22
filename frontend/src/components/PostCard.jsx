import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const CATEGORIES_PALETTE = [
  '#6c63ff','#38bdf8','#34d399','#fbbf24','#f87171','#a78bfa','#f472b6',
];

function getCategoryColor(cat) {
  let hash = 0;
  for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  return CATEGORIES_PALETTE[Math.abs(hash) % CATEGORIES_PALETTE.length];
}

export default function PostCard({ post, onBookmarkToggle }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isBookmarked = user?.bookmarks?.includes(post._id);

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!user) { toast.error('Please login to bookmark'); navigate('/login'); return; }
    try {
      const res = await axios.put(`/api/users/${user._id}/bookmark/${post._id}`, {}, { withCredentials: true });
      toast.success(res.data.message);
      if (onBookmarkToggle) onBookmarkToggle(post._id, res.data.bookmarked);
    } catch { toast.error('Failed to update bookmark'); }
  };

  const excerpt = post.content?.replace(/<[^>]+>/g, '').slice(0, 140) + '...';
  const initials = (post.username || 'U').slice(0, 2).toUpperCase();

  return (
    <article className="card post-card fade-in" onClick={() => navigate(`/post/${post._id}`)}>
      {post.photo ? (
        <img src={post.photo} alt={post.title} className="post-card-img" loading="lazy" />
      ) : (
        <div className="post-card-img-placeholder">📝</div>
      )}

      <div className="post-card-body">
        <div className="post-card-meta">
          {post.userId?.profilePic ? (
            <img src={post.userId.profilePic} alt={post.username} className="avatar avatar-sm" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div className="avatar avatar-sm" style={{ width: 24, height: 24, fontSize: '0.65rem', background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' }}>{initials}</div>
          )}
          <span className="post-card-author">{post.username}</span>
          <span className="post-card-date">{moment(post.createdAt).fromNow()}</span>

          {post.categories?.slice(0, 1).map((cat) => (
            <span key={cat} className="badge" style={{ background: `${getCategoryColor(cat)}22`, color: getCategoryColor(cat), borderColor: `${getCategoryColor(cat)}44` }}>
              {cat}
            </span>
          ))}
        </div>

        <h2 className="post-card-title">{post.title}</h2>
        <p className="post-card-excerpt">{excerpt}</p>

        <div className="post-card-footer">
          <div className="post-card-stats">
            <span className="post-stat">👁 {post.views || 0}</span>
            <span className="post-stat">📅 {moment(post.createdAt).format('MMM D')}</span>
          </div>
          <button
            className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
            onClick={handleBookmark}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            aria-label="Bookmark"
          >
            {isBookmarked ? '🔖' : '🔖'}
          </button>
        </div>
      </div>
    </article>
  );
}
