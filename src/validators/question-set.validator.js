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

// The largest value a 32-bit integer column can hold.
const idParam = param('id')
  .isInt({ min: 1, max: 2147483647 })
  .withMessage('id must be a positive whole number')
  .toInt();

// A PATCH must change at least one field.
const atLeastOne = body().custom((_, { req }) => {
  const b = req.body;
  const hasTitle = b && typeof b === 'object' && b.title !== undefined;
  const hasDescription = b && typeof b === 'object' && b.description !== undefined;
  if (!hasTitle && !hasDescription) {
    throw new Error('send at least one field to change: title or description');
  }
  return true;
});

const createRules = [titleRule({ required: true }), descriptionRule()];
const updateRules = [idParam, atLeastOne, titleRule({ required: false }), descriptionRule()];

module.exports = { createRules, updateRules, idParam };