const { validationResult } = require('express-validator');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const generateToken = require('../utils/generateToken');

function formatValidationErrors(result) {
  return result.array().map((e) => ({ field: e.param, message: e.msg }));
}

// POST /api/auth/register
// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: formatValidationErrors(errors) });
    }

    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return next(new ErrorResponse('Aquest email ja està registrat', 400));
    }

    // Assignar rol per defecte 'user'
    const Role = require('../models/Role');
    const userRole = await Role.findOne({ name: 'user' });
    const roles = userRole ? [userRole._id] : [];

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      roles,
    });

    const token = generateToken(user);

    // Obtenir permisos efectius per retornar-los
    const permissions = await user.getEffectivePermissions();

    return res.status(201).json({
      success: true,
      message: "Usuari registrat correctament",
      data: {
        token,
        user: { ...user.toJSON(), roles: [userRole] }, // Incloure info bàsica del rol si cal
        permissions
      },
    });
  } catch (err) {
    return next(err);
  }
};

// POST /api/auth/login
// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: formatValidationErrors(errors) });
    }

    const { email, password } = req.body;

    // Incloure roles per mostrar info
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate('roles');

    if (!user) {
      return next(new ErrorResponse('Credencials incorrectes', 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Credencials incorrectes', 401));
    }

    const token = generateToken(user);
    const permissions = await user.getEffectivePermissions();

    // toJSON elimina password
    return res.status(200).json({
      success: true,
      message: 'Sessió iniciada correctament',
      data: { token, user: user.toJSON(), permissions },
    });
  } catch (err) {
    return next(err);
  }
};

// GET /api/auth/me (protected)
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('roles');
    const permissions = await user.getEffectivePermissions();

    return res.status(200).json({
      success: true,
      data: { ...user.toJSON(), permissions },
    });
  } catch (e) { next(e); }
};

// PUT /api/auth/profile (protected)
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: formatValidationErrors(errors) });
    }

    const { name, email } = req.body;

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const inUse = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user._id } });
      if (inUse) {
        return next(new ErrorResponse('Aquest email ja està en ús', 400));
      }
      req.user.email = normalizedEmail;
    }

    if (name !== undefined) {
      req.user.name = name;
    }

    // No permetem canviar rol
    await req.user.save();

    return res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (err) {
    return next(err);
  }
};

// PUT /api/auth/change-password (protected)
exports.changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: formatValidationErrors(errors) });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return next(new ErrorResponse('Usuari no trobat', 404));
    }

    const ok = await user.comparePassword(currentPassword);
    if (!ok) {
      return next(new ErrorResponse('La contrasenya actual no és correcta', 401));
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Contrasenya actualitzada correctament',
    });
  } catch (err) {
    return next(err);
  }
};
// POST /api/auth/check-permission
exports.checkPermission = async (req, res, next) => {
  try {
    const { permission } = req.body;
    if (!permission) return next(new ErrorResponse('Falta paràmetre permission', 400));

    const Permission = require('../models/Permission');
    const permExists = await Permission.exists({ name: permission });
    if (!permExists) {
      return res.status(400).json({ success: false, error: 'El permís especificat no existeix' });
    }

    const has = await req.user.hasPermission(permission);

    if (has) {
      return res.status(200).json({ success: true, hasPermission: true, message: 'Tens permís per fer aquesta acció' });
    } else {
      return res.status(403).json({ success: false, hasPermission: false, message: 'No tens permís per fer aquesta acció' });
    }

  } catch (e) { next(e); }
};
