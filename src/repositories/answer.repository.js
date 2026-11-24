// The only file that queries answers. No rules, no status codes.
const { Answer } = require('../models');

// options carries { transaction: t } so the insert joins the caller's transaction.
function create(data, options = {}) {
  return Answer.create(data, options);
}

module.exports = { create };