const AppError = require('../utils/AppError');

function authorize(...allowedRoles) {
  return function authorizationMiddleware(req, res, next) {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      next(
        new AppError(
          'You do not have permission for this action.',
          403,
          'FORBIDDEN',
        ),
      );
      return;
    }

    next();
  };
}

module.exports = authorize;
