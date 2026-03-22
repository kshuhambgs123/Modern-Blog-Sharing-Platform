import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import PostCard from '../components/PostCard';

export default function Search() {
  const query = new URLSearchParams(useLocation().search).get('q');
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(query || '');

  useEffect(() => {
    if (query) {
      setSearchTerm(query);
      fetchResults(query);
    } else {
      setLoading(false);
    }
  }, [query]);

  const fetchResults = async (q) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/posts?search=${encodeURIComponent(q)}`);
      setPosts(res.data.posts || []);
    } catch {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="search-page fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', fontWeight: 800 }}>Explore Story Archive</h1>
        <p style={{ color: 'var(--text2)', fontSize: '0.95rem' }}>Search by title, content, or hashtags</p>
      </div>

      <form className="search-bar" onSubmit={handleSearchSubmit}>
        <input 
          type="text" 
          className="form-input" 
          placeholder="What are you looking for?" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          autoFocus={true}
        />
        <button type="submit" className="btn btn-primary" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>Search</button>
      </form>

      {query && (
        <p style={{ color: 'var(--text3)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Displaying {posts.length} results for: "<strong>{query}</strong>"
        </p>
      )}

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : query && posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔎</div>
          <h3>No matching stories found</h3>
          <p>Try searching for different keywords or browse by category.</p>
          <Link to="/" className="btn btn-secondary" style={{ marginTop: '1.25rem' }}>Return Home</Link>
        </div>
      ) : (
        <div className="post-grid">
          {posts.map(post => <PostCard key={post._id} post={post} />)}
        </div>
      )}

      {!query && (
         <div className="empty-state">
            <div className="empty-state-icon">💡</div>
            <h3>Type something to search</h3>
            <p>Enter keywords like 'technology', 'trips', or 'healthy' above.</p>
         </div>
      )}
    </div>
  );
}
