import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';

const CATEGORIES = ['Technology','Lifestyle','Travel','Food','Health','Finance','Education','Science','Entertainment','Sports','Art','Business'];

export default function Home() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, page]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (activeCategory) params.category = activeCategory;
      const res = await axios.get('/api/posts', { params });
      setPosts(res.data.posts || []);
      setTotalPages(res.data.pages || 1);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = (postId, bookmarked) => {
    if (!user) return;
    setUser((prev) => {
      const bookmarks = prev.bookmarks || [];
      return {
        ...prev,
        bookmarks: bookmarked
          ? [...bookmarks, postId]
          : bookmarks.filter((id) => id !== postId),
      };
    });
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat === activeCategory ? '' : cat);
    setPage(1);
  };

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Ideas Worth Sharing</h1>
          <p className="hero-sub">
            Discover thoughtful articles, personal stories, and expert insights — then share your own voice with the world.
          </p>
          {!user && (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>
                ✨ Start Writing
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/search')}>
                🔍 Explore Posts
              </button>
            </div>
          )}
          {user && (
            <button className="btn btn-primary" onClick={() => navigate('/write')}>
              ✏️ Write a Post
            </button>
          )}
        </div>
      </section>

      {/* Main content */}
      <div className="main-with-sidebar">
        <div>
          {/* Category filter mobile */}
          <div className="category-list" style={{ marginBottom: '1.5rem' }}>
            <button
              className={`category-chip ${activeCategory === '' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('')}
            >All</button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat)}
              >{cat}</button>
            ))}
          </div>

          {/* Posts */}
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3>No posts yet</h3>
              <p>Be the first to share something amazing!</p>
              {user && <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/write')}>Write the first post</button>}
            </div>
          ) : (
            <>
              <div className="post-grid">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} onBookmarkToggle={handleBookmarkToggle} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ minWidth: 36 }}
                    >{p}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="sidebar">
          {/* Categories widget */}
          <div className="card sidebar-widget">
            <p className="sidebar-title">Browse by Topic</p>
            <div className="category-list">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat)}
                >{cat}</button>
              ))}
            </div>
          </div>

          {/* CTA widget */}
          {!user && (
            <div className="card sidebar-widget" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(167,139,250,0.08))', borderColor: 'rgba(108,99,255,0.2)' }}>
              <p className="sidebar-title">Join Inkwell</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text2)', marginBottom: '1rem', lineHeight: 1.6 }}>
                Create an account to publish posts, comment, and bookmark your favorites.
              </p>
              <button className="btn btn-primary btn-sm w-full" onClick={() => navigate('/register')} style={{ justifyContent: 'center' }}>
                Get Started →
              </button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
