const { body } = require('express-validator');

const createTaskValidation = [
  body('title').notEmpty().withMessage('El títol és obligatori').isLength({ min: 2 }).withMessage('El títol ha de tenir mínim 2 caràcters').trim(),
  body('description').optional().isLength({ max: 2000 }).withMessage('La descripció és massa llarga').trim(),
  body('cost').optional().isFloat({ min: 0 }).withMessage('El cost ha de ser un número positiu'),
  body('hours_estimated').optional().isFloat({ min: 0 }).withMessage('Les hores estimades han de ser un número positiu'),
  body('completed').optional().isBoolean().withMessage('completed ha de ser booleà'),
];

const updateTaskValidation = [
  body('title').optional().isLength({ min: 2 }).withMessage('El títol ha de tenir mínim 2 caràcters').trim(),
  body('description').optional().isLength({ max: 2000 }).withMessage('La descripció és massa llarga').trim(),
  body('cost').optional().isFloat({ min: 0 }).withMessage('El cost ha de ser un número positiu'),
  body('hours_estimated').optional().isFloat({ min: 0 }).withMessage('Les hores estimades han de ser un número positiu'),
  body('completed').optional().isBoolean().withMessage('completed ha de ser booleà'),
];

module.exports = {
  createTaskValidation,
  updateTaskValidation,
};
