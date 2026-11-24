const { AppError } = require('./errorHandler');

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('User not authenticated.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden: '${req.user.role}' role is not authorized to access this resource. Required role(s): ${allowedRoles.join(', ')}`,
          403
        )
      );
    }

    next();
  };
};

module.exports = { requireRole };
