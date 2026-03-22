import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import Profile from './pages/Profile';
import Bookmarks from './pages/Bookmarks';
import Search from './pages/Search';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/login"       element={<Login />} />
            <Route path="/register"    element={<Register />} />
            <Route path="/post/:id"    element={<PostDetail />} />
            <Route path="/write"       element={<CreatePost />} />
            <Route path="/edit/:id"    element={<EditPost />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/bookmarks"   element={<Bookmarks />} />
            <Route path="/search"      element={<Search />} />
            <Route path="*"            element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a1e2a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' },
          duration: 3500,
        }}
      />
    </Router>
  );
}

export default App;
