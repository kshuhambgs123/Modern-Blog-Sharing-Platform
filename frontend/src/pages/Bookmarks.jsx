import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';

export default function Bookmarks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookmarks();
  }, [user, navigate]);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/users/${user._id}/bookmarks`, { withCredentials: true });
      setBookmarks(res.data || []);
    } catch {
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = (postId, bookmarked) => {
    if (!bookmarked) {
      // If unbookmarked, remove from local list
      setBookmarks(prev => prev.filter(p => (p._id || p) !== postId));
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', fontWeight: 800 }}>Bookmarks</h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.95rem' }}>Your personal collection of saved stories</p>
        </div>
        <Link to="/" className="btn btn-secondary btn-sm">← Back Home</Link>
      </div>

      {bookmarks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔖</div>
          <h3>Your reading list is empty</h3>
          <p>Bookmark stories you love to read them later!</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>Discover Stories</Link>
        </div>
      ) : (
        <div className="post-grid">
          {bookmarks.map((post) => (
            <PostCard 
              key={post._id} 
              post={post} 
              onBookmarkToggle={handleBookmarkToggle} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
