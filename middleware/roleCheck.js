const ErrorResponse = require('../utils/errorResponse');

/**
 * Middleware de control d'accés per rols.
 * Ús: roleCheck(['admin'])
 */
function roleCheck(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('No autoritzat', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ErrorResponse('No tens permisos per accedir a aquest recurs', 403));
    }

    return next();
  };
}

module.exports = roleCheck;
