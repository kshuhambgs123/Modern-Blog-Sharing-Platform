import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Technology','Lifestyle','Travel','Food','Health','Finance','Education','Science','Entertainment','Sports','Art','Business'];

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [cat, setCat] = useState('');
  const [cats, setCats] = useState([]);
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const addCategory = (c) => {
    if (c && !cats.includes(c)) setCats([...cats, c]);
    setCat('');
  };

  const removeCategory = (c) => setCats(cats.filter((item) => item !== c));

  const addTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tag.trim().replace(/,/g, '');
      if (val && !tags.includes(val)) setTags([...tags, val]);
      setTag('');
    }
  };

  const removeTag = (t) => setTags(tags.filter((item) => item !== t));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return toast.error('Title and content are required');
    
    setLoading(true);
    const newPost = {
      title,
      content,
      username: user.username,
      userId: user._id,
      categories: cats,
      tags: tags,
    };

    try {
      if (file) {
        const data = new FormData();
        data.append('file', file);
        const imgRes = await axios.post('/api/posts/upload', data, { withCredentials: true });
        newPost.photo = imgRes.data.url;
      }

      const res = await axios.post('/api/posts', newPost, { withCredentials: true });
      toast.success('Post published successfully! 🎉');
      navigate(`/post/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="write-page fade-in">
      <div className="write-header">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create New Story</h1>
        <button 
          className="btn btn-primary" 
          onClick={handleSubmit} 
          disabled={loading}
        >
          {loading ? 'Publishing...' : 'Publish Post'}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Title Input */}
        <input
          type="text"
          className="write-title-input"
          placeholder="Enter a compelling title..."
          autoFocus={true}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Categories & Tags section */}
        <div style={{ display: 'flex', gap: '1.5rem', margin: '2rem 0', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <label className="form-label">Categories</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <select 
                className="form-input" 
                value={cat} 
                onChange={(e) => addCategory(e.target.value)}
                style={{ padding: '0.5rem' }}
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="category-list">
              {cats.map(c => (
                <span key={c} className="badge">
                  {c} <button type="button" onClick={() => removeCategory(c)} style={{ background: 'none', border: 'none', color: 'inherit', marginLeft: '4px', cursor: 'pointer' }}>×</button>
                </span>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 280 }}>
            <label className="form-label">Tags (Press Enter)</label>
            <div className="tag-input-wrapper">
              {tags.map(t => (
                <span key={t} className="tag-pill">
                  #{t} <button type="button" onClick={() => removeTag(t)}>×</button>
                </span>
              ))}
              <input
                type="text"
                className="tag-text-input"
                placeholder="Add tag..."
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                onKeyDown={addTag}
              />
            </div>
          </div>
        </div>

        {/* Thumbnail Upload */}
        <div 
          className={`img-upload-area ${preview ? 'has-preview' : ''}`}
          onClick={() => fileInputRef.current.click()}
        >
          <input 
            type="file" 
            hidden 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept="image/*"
          />
          {preview ? (
            <div style={{ position: 'relative' }}>
              <img src={preview} alt="Preview" className="img-preview" />
              <p style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>Click to change image</p>
            </div>
          ) : (
            <div>
              <span style={{ fontSize: '2rem' }}>🖼️</span>
              <p style={{ fontWeight: 600, marginTop: '0.5rem' }}>Add a cover image</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>Drag and drop or click to browse</p>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label className="form-label">Story Content</label>
          <textarea
            className="form-input"
            placeholder="Tell your story... (Plain text or Markdown supported)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ minHeight: '400px', fontSize: '1.05rem', lineHeight: 1.8 }}
          />
        </div>
      </form>
    </div>
  );
}
