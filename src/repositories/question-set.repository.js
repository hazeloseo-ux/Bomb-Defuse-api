// The only file that queries question_sets. No rules, no status codes.
const { Op } = require('sequelize');
const { QuestionSet } = require('../models');
const { toOffset } = require('../utils/paginate');

// One page of a host's sets, plus the total count (for meta.total).
function findAndCountByHost(hostId, { page, limit, q, sort = 'question_set_id', order = 'asc' }) {
  const where = { host_id: hostId };
  if (q) where.title = { [Op.iLike]: `%${q}%` }; // q is a bound value, not SQL text
  return QuestionSet.findAndCountAll({
    where,
    order: [[sort, order.toUpperCase()]], // sort was checked against the allow-list
    ...toOffset({ page, limit }),
  });
}

function findById(id) {
  return QuestionSet.findByPk(id); // a row, or null
}

function create(data) {
  return QuestionSet.create(data);
}

function update(questionSet, changes) {
  return questionSet.update(changes);
}

function remove(questionSet) {
  return questionSet.destroy();
}

module.exports = { findAndCountByHost, findById, create, update, remove };