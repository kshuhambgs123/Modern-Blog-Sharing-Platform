const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'You are not authenticated' });

  jwt.verify(token, JWT_SECRET, (err, data) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.userId   = data._id;
    req.username = data.username;
    next();
  });
};

module.exports = verifyToken;
