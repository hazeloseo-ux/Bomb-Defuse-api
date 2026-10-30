// What a well-formed request looks like. Never asks the database.
const { body, param } = require('express-validator');

function titleRule({ required }) {
  const chain = body('title');
  if (!required) chain.optional();
  return chain
    .exists().withMessage('title is required')
    .bail()
    .isString().withMessage('title must be text')
    .bail()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('title must be 3 to 100 characters long');
}

const descriptionRule = () =>
  body('description')
    .optional({ values: 'null' })
    .isString().withMessage('description must be text')
    .bail()
    .trim()
    .isLength({ max: 500 })
    .withMessage('description must be at most 500 characters long');

const idParam = param('id')
  .isInt({ min: 1 })
  .withMessage('id must be a positive whole number')
  .toInt();

const createRules = [titleRule({ required: true }), descriptionRule()];
const updateRules = [idParam, titleRule({ required: false }), descriptionRule()];

module.exports = { createRules, updateRules, idParam };