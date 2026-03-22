import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';

export default function Profile() {
  const { id } = useParams();
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const fileInputRef = useRef(null);

  const isOwnProfile = user && user._id === id;

  useEffect(() => {
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const profileRes = await axios.get(`/api/users/${id}`);
      setProfile(profileRes.data);
      setBio(profileRes.data.bio || '');
      setUsername(profileRes.data.username || '');
      
      const postsRes = await axios.get(`/api/users/${id}/posts`);
      setPosts(postsRes.data || []);
    } catch {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await axios.put(`/api/users/${id}`, { bio, username }, { withCredentials: true });
      setProfile(res.data);
      if (isOwnProfile) setUser(res.data);
      toast.success('Profile updated! ✨');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('profilePic', file);
    
    setUpdating(true);
    try {
      const res = await axios.put(`/api/users/${id}`, formData, { withCredentials: true });
      setProfile(res.data);
      if (isOwnProfile) setUser(res.data);
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!profile) return <div className="container text-center" style={{ marginTop: '5rem' }}><h2>User not found</h2><Link to="/">Go Home</Link></div>;

  return (
    <div className="profile-page fade-in">
      {/* Header card */}
      <div className="profile-header card">
        <div style={{ position: 'relative' }}>
          {profile.profilePic ? (
            <img src={profile.profilePic} alt={profile.username} className="avatar avatar-xl" />
          ) : (
            <div className="avatar avatar-xl">{(profile.username || 'U').slice(0, 2).toUpperCase()}</div>
          )}
          
          {isOwnProfile && (
            <button 
              className="btn btn-secondary btn-icon" 
              style={{ position: 'absolute', bottom: 4, right: 4, padding: '0.4rem', borderRadius: '50%', background: 'var(--bg2)' }}
              onClick={() => fileInputRef.current.click()}
              title="Change profile picture"
            >
              📷
              <input type="file" hidden ref={fileInputRef} onChange={handleProfilePicChange} accept="image/*" />
            </button>
          )}
        </div>

        <div className="profile-info">
          {!isEditing ? (
            <>
              <h1 className="profile-name">{profile.username}</h1>
              <p style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>Joined {new Date(profile.createdAt).toLocaleDateString()}</p>
              <p className="profile-bio">{profile.bio || "This user hasn't written a bio yet."}</p>
              
              {isOwnProfile && (
                <button className="btn btn-secondary btn-sm" style={{ marginTop: '1.2rem' }} onClick={() => setIsEditing(true)}>
                  ⚙️ Edit Profile
                </button>
              )}
            </>
          ) : (
            <form onSubmit={handleUpdate} className="slide-down">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input 
                  className="form-input" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea 
                  className="form-input" 
                  rows={2} 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={updating}>
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="profile-stats">
          <div className="profile-stat">
            <p className="profile-stat-num">{posts.length}</p>
            <p className="profile-stat-label">Posts</p>
          </div>
        </div>
      </div>

      {/* Tabs / Content */}
      <div className="tabs">
        <button className="tab active">Stories</button>
      </div>

      <div className="post-grid">
        {posts.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state-icon">📝</div>
            <h3>No stories yet</h3>
            <p>Stories shared by {profile.username} will appear here.</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}
