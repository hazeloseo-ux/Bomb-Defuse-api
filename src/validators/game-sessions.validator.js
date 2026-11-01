// What a well-formed request looks like. Never asks the database.
const { body, param } = require('express-validator');

const codeParam = param('code')
  .matches(/^[0-9]{6}$/)
  .withMessage('the join code must be six digits');

const questionSetId = body('question_set_id')
  .exists().withMessage('question_set_id is required')
  .bail()
  .isInt({ min: 1 }).withMessage('question_set_id must be a positive whole number')
  .toInt();

const timeLimit = body('time_limit_seconds')
  .optional()
  .isInt({ min: 30, max: 3600 })
  .withMessage('time_limit_seconds must be a whole number from 30 to 3600')
  .toInt();

const status = body('status')
  .exists().withMessage('status is required')
  .bail()
  .isIn(['IN_PROGRESS', 'CLOSED'])
  .withMessage('status must be IN_PROGRESS or CLOSED');

const nickname = body('nickname')
  .exists().withMessage('nickname is required')
  .bail()
  .isString().withMessage('nickname must be text')
  .bail()
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('nickname must be 2 to 50 characters long');

const createRules = [questionSetId, timeLimit];
const statusRules = [codeParam, status];
const joinRules = [codeParam, nickname];

module.exports = { codeParam, createRules, statusRules, joinRules };