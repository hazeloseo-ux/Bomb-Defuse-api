const { body, param } = require('express-validator');

const ROLES = ['PLAYER', 'HOST', 'ADMIN'];

// No rule for "role" here: matchedData drops anything without a rule,
// so a "role" in the register body never reaches the service.
const registerRules = [
  body('school_id').isString().trim().matches(/^\d{4}-\d{4}$/)
    .withMessage('school_id must look like 2024-0001'),
  body('full_name').isString().trim().isLength({ min: 1, max: 100 })
    .withMessage('full_name is required (up to 100 characters)'),
  body('email').isString().trim().isEmail().isLength({ max: 255 })
    .withMessage('email must be a valid address'),
  body('password').isString().isLength({ min: 8, max: 72 })
    .withMessage('password must be 8 to 72 characters')
    .matches(/[A-Za-z]/).withMessage('password needs a letter')
    .matches(/\d/).withMessage('password needs a number'),
];

// Text only: an object like {"$ne": ""} is refused here, before it reaches a query.
const loginRules = [
  body('school_id').isString().trim().notEmpty().withMessage('school_id is required'),
  body('password').isString().notEmpty().withMessage('password is required'),
];

const roleRules = [
  param('id').isInt({ min: 1 }).withMessage('id must be a whole number from 1').toInt(),
  body('role').isIn(ROLES).withMessage(`role must be one of: ${ROLES.join(', ')}`),
];

module.exports = { registerRules, loginRules, roleRules };