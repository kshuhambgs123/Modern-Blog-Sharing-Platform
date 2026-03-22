import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ICONS = {
  pen: '✏️', search: '🔍', bookmark: '🔖', user: '👤', logout: '🚪',
  home: '🏠', plus: '➕', menu: '☰'
};

export default function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    }
    setMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) { navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`); setSearchQ(''); }
  };

  const getInitials = (name = '') => name.slice(0, 2).toUpperCase();

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* Brand */}
          <Link to="/" className="navbar-brand">Inkwell</Link>

          {/* Center: Search */}
          <form className="navbar-search" onSubmit={handleSearch} style={{ flex: 1, maxWidth: 320, margin: '0 1.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>{ICONS.search}</span>
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search posts..."
              id="navbar-search-input"
            />
          </form>

          {/* Right: Links + User */}
          <div className="navbar-links">
            <NavLink to="/" className="navbar-link" end>Home</NavLink>

            {user ? (
              <>
                <NavLink to="/write" className="navbar-link">Write</NavLink>
                <NavLink to="/bookmarks" className="navbar-link">{ICONS.bookmark}</NavLink>
                <div className="user-menu" ref={menuRef}>
                  <div className="user-menu-toggle" onClick={() => setMenuOpen((v) => !v)} id="user-menu-btn" role="button" tabIndex={0}>
                    {user.profilePic ? (
                      <img src={user.profilePic} alt={user.username} className="avatar avatar-sm" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div className="avatar avatar-sm" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>{getInitials(user.username)}</div>
                    )}
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.username}</span>
                    <span style={{ color: 'var(--text3)', fontSize: '0.7rem' }}>▾</span>
                  </div>

                  {menuOpen && (
                    <div className="user-dropdown slide-down">
                      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>{user.username}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{user.email}</p>
                      </div>
                      <div onClick={() => { navigate(`/profile/${user._id}`); setMenuOpen(false); }} className="user-dropdown-item">
                        {ICONS.user} My Profile
                      </div>
                      <div onClick={() => { navigate('/bookmarks'); setMenuOpen(false); }} className="user-dropdown-item">
                        {ICONS.bookmark} Bookmarks
                      </div>
                      <div onClick={() => { navigate('/write'); setMenuOpen(false); }} className="user-dropdown-item">
                        {ICONS.pen} New Post
                      </div>
                      <div className="user-dropdown-divider" />
                      <div onClick={handleLogout} className="user-dropdown-item danger">
                        {ICONS.logout} Logout
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn btn-secondary btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
