const ErrorResponse = require('../utils/errorResponse');
const AuditLog = require('../models/AuditLog');

const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return next(new ErrorResponse('Usuari no autenticat', 401));
            }

            const hasPermission = await req.user.hasPermission(requiredPermission);

            if (!hasPermission) {
                // Registrar intent fallit automàticament
                await AuditLog.log(
                    req.user._id,
                    requiredPermission, // Use permission as action name for denial or construct one
                    req.method + ' ' + req.originalUrl,
                    'permission_check',
                    'error',
                    null,
                    req,
                    'Permission denied'
                );
                return next(new ErrorResponse(`No tens permís per fer aquesta acció. Requereix: ${requiredPermission}`, 403));
            }

            req.permission = requiredPermission; // Passar info per si es necessita
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = checkPermission;
