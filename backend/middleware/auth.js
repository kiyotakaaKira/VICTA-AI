// Temporary hackathon auth bypass
const requireAuth = (req, res, next) => {
  // Mock a user with admin privileges for hackathon
  req.user = {
    id: 'hackathon-user-001',
    role: 'admin', // roles: 'investigator', 'analyst', 'admin'
    name: 'Hackathon Admin'
  };
  next();
};

const requireRole = (roles) => {
  return (req, res, next) => {
    requireAuth(req, res, () => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient role permissions' } });
      }
      next();
    });
  };
};

module.exports = {
  requireAuth,
  requireRole,
};