import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('[Auth] Missing bearer token');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[Auth] Token decoded for userId:', decoded?.userId);
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('[Auth] User not found for token userId:', decoded?.userId);
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log('[Auth] Invalid token:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
