const jwt = require('jsonwebtoken');
const store = require('../data/store');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      
      const user = store.findById('users', decoded.id);
      if (user) {
        // Exclude password manually to replicate .select('-password')
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
      } else {
        throw new Error('User not found in store');
      }
      
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'Administrator') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };
