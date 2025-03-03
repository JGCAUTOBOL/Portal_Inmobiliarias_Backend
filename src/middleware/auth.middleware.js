exports.isAuthenticated = (req, res, next) => {
    if (req.session.isAuthenticated) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };