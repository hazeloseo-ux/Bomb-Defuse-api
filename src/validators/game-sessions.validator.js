// What a well-formed request looks like. Never asks the database.
const { body, param } = require('express-validator');

// Six digits, and the first digit is 1 to 9 (a code never starts with 0).
const codeParam = param('code')
  .matches(/^[1-9][0-9]{5}$/)
  .withMessage('the join code must be six digits and not start with 0');

// 2147483647 is the largest value a 32-bit integer column can hold.
const questionSetId = body('question_set_id')
  .exists().withMessage('question_set_id is required')
  .bail()
  .isInt({ min: 1, max: 2147483647 }).withMessage('question_set_id must be a positive whole number')
  .toInt();

const timeLimit = body('time_limit_seconds')
  .optional()
  .isInt({ min: 30, max: 3600 })
  .withMessage('time_limit_seconds must be a whole number from 30 to 3600')
  .toInt();

const status = body('status')
  .optional()
  .isIn(['IN_PROGRESS', 'CLOSED'])
  .withMessage('status must be IN_PROGRESS or CLOSED');

// Only the next question is allowed, and the service checks that. Here: a whole number from 1.
const position = body('current_position')
  .optional()
  .isInt({ min: 1, max: 2147483647 })
  .withMessage('current_position must be a positive whole number')
  .toInt();

// A PATCH changes the status OR the question, never both and never nothing.
const exactlyOne = body().custom((_, { req }) => {
  const b = req.body;
  const isObject = b && typeof b === 'object';
  const hasStatus = isObject && b.status !== undefined;
  const hasPosition = isObject && b.current_position !== undefined;
  if (hasStatus === hasPosition) {
    throw new Error('send either status or current_position, not both and not neither');
  }
  return true;
});

const nickname = body('nickname')
  .exists().withMessage('nickname is required')
  .bail()
  .isString().withMessage('nickname must be text')
  .bail()
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('nickname must be 2 to 50 characters long');

// Only the shape is checked here. Whether the choice is 0 to 3 is the service's job (it must come after the other checks).
const answerQuestionId = body('question_id')
  .exists().withMessage('question_id is required')
  .bail()
  .isInt({ min: 1, max: 2147483647 }).withMessage('question_id must be a positive whole number')
  .toInt();

const answerChoice = body('choice_index')
  .exists().withMessage('choice_index is required')
  .bail()
  .isInt().withMessage('choice_index must be a whole number')
  .toInt();

const createRules = [questionSetId, timeLimit];
const statusRules = [codeParam, exactlyOne, status, position];
const joinRules = [codeParam, nickname];
const answerRules = [codeParam, answerQuestionId, answerChoice];

module.exports = { codeParam, createRules, statusRules, joinRules, answerRules };