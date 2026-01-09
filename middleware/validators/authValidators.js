const { body } = require('express-validator');

// Helpers
const emailValidator = body('email')
  .isEmail()
  .withMessage('Email no vàlid')
  .normalizeEmail();

const passwordMinValidator = body('password')
  .isLength({ min: 6 })
  .withMessage('La contrasenya ha de tenir mínim 6 caràcters');

const optionalNameValidator = body('name')
  .optional()
  .isLength({ min: 2 })
  .withMessage('El nom ha de tenir mínim 2 caràcters')
  .trim();

const registerValidation = [emailValidator, passwordMinValidator, optionalNameValidator];

const loginValidation = [
  body('email').notEmpty().withMessage('Email obligatori'),
  body('email').isEmail().withMessage('Email no vàlid').normalizeEmail(),
  body('password').notEmpty().withMessage('Contrasenya obligatòria'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Contrasenya actual obligatòria'),
  body('newPassword').isLength({ min: 6 }).withMessage('La nova contrasenya ha de tenir mínim 6 caràcters'),
];

const updateProfileValidation = [
  body('name').optional().isLength({ min: 2 }).withMessage('El nom ha de tenir mínim 2 caràcters').trim(),
  body('email').optional().isEmail().withMessage('Email no vàlid').normalizeEmail(),
];

module.exports = {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  updateProfileValidation,
};
