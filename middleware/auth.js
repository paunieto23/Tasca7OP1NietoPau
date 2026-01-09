const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Middleware d'autenticació JWT.
 * - Llegeix header Authorization: Bearer <token>
 * - Verifica token
 * - Carrega usuari i el posa a req.user
 */
module.exports = async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return next(new ErrorResponse('No autoritzat. Token no proporcionat', 401));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return next(new ErrorResponse('Token invàlid o expirat', 401));
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new ErrorResponse('No autoritzat. Usuari no trobat', 401));
    }

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
};
