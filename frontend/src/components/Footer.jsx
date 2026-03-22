import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>
          <strong style={{ color: 'var(--text2)' }}>Inkwell</strong> — A MERN Blog Platform &nbsp;·&nbsp;
          Built with ❤️ using React, Node.js, Express & MongoDB
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} Inkwell. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
