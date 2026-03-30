// @desc    Protect routes middleware
export const protect = (req, res, next) => {
  // Passport adds the isAuthenticated() function to the request object
  if (req.isAuthenticated()) {
    return next(); // User is authenticated, proceed to the requested route
  }
  // Not authenticated
  res.status(401).json({ message: 'Not authorized, please login' });
};

// @desc    Admin only middleware
export const adminProtect = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Not authorized as an administrator' });
};

// @desc    Admin or Coordinator middleware
export const coordinatorProtect = (req, res, next) => {
  if (req.isAuthenticated() && (req.user.role === 'admin' || req.user.role === 'coordinator')) {
    return next();
  }
  res.status(403).json({ message: 'Not authorized. Admin or Coordinator role required.' });
};
