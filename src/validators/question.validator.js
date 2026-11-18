// What a well-formed question request looks like. Never asks the database.
const { body, param } = require('express-validator');
const { idParam } = require('./question-set.validator');
const { pageRules } = require('./list.validator');

const questionIdParam = param('questionId')
  .isInt({ min: 1, max: 2147483647 })
  .withMessage('questionId must be a positive whole number')
  .toInt();

function typeRule({ required }) {
  const chain = body('question_type');
  if (!required) chain.optional();
  return chain
    .exists().withMessage('question_type is required')
    .bail()
    .isIn(['TOOL', 'CUT'])
    .withMessage('question_type must be TOOL or CUT');
}

function textRule({ required }) {
  const chain = body('question_text');
  if (!required) chain.optional();
  return chain
    .exists().withMessage('question_text is required')
    .bail()
    .isString().withMessage('question_text must be text')
    .bail()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('question_text must be 5 to 500 characters long');
}

// Exactly four choices: A, B, C and D.
function choicesRule({ required }) {
  const chain = body('choices');
  if (!required) chain.optional();
  return chain
    .isArray({ min: 4, max: 4 })
    .withMessage('choices must be a list of exactly 4 texts');
}

const eachChoiceRule = body('choices.*')
  .isString().withMessage('each choice must be text')
  .bail()
  .trim()
  .isLength({ min: 1, max: 255 })
  .withMessage('each choice must be 1 to 255 characters long');

// One correct choice only: a single whole number 0 to 3, never a list like [0, 1].
function correctRule({ required }) {
  const chain = body('correct_index');
  if (!required) chain.optional();
  return chain
    .custom((value) => Number.isInteger(value) && value >= 0 && value <= 3)
    .withMessage('correct_index must be one whole number from 0 to 3');
}

// A PATCH must change at least one field.
const atLeastOne = body().custom((_, { req }) => {
  const b = req.body;
  const fields = ['question_type', 'question_text', 'choices', 'correct_index'];
  const sent = b && typeof b === 'object' && fields.some((f) => b[f] !== undefined);
  if (!sent) {
    throw new Error('send at least one field to change: ' + fields.join(', '));
  }
  return true;
});

const listRules = [idParam, ...pageRules];
const createRules = [
  idParam,
  typeRule({ required: true }),
  textRule({ required: true }),
  choicesRule({ required: true }),
  eachChoiceRule,
  correctRule({ required: true }),
];
const updateRules = [
  idParam,
  questionIdParam,
  atLeastOne,
  typeRule({ required: false }),
  textRule({ required: false }),
  choicesRule({ required: false }),
  eachChoiceRule,
  correctRule({ required: false }),
];
const removeRules = [idParam, questionIdParam];

module.exports = { listRules, createRules, updateRules, removeRules };