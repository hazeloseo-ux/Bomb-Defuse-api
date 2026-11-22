// The only file that queries questions. No rules, no status codes.
const { Question, GameSession } = require('../models');
const { toOffset } = require('../utils/paginate');

// A question's position is its order here: oldest first. The server decides it, never the client.
function findAndCountBySet(questionSetId, { page, limit }, options = {}) {
  return Question.findAndCountAll({
    where: { question_set_id: questionSetId },
    order: [['question_id', 'ASC']],
    ...toOffset({ page, limit }),
    ...options,
  });
}

// A question only counts if it belongs to the set in the URL.
function findInSet(questionSetId, questionId, options = {}) {
  return Question.findOne({
    where: { question_id: questionId, question_set_id: questionSetId },
    ...options,
  });
}

function create(data, options = {}) {
  return Question.create(data, options);
}

function update(question, changes, options = {}) {
  return question.update(changes, options);
}

function remove(question, options = {}) {
  return question.destroy(options);
}

// How many games were created from this set. More than 0 means the set is frozen.
function countGamesUsingSet(questionSetId, options = {}) {
  return GameSession.count({ where: { question_set_id: questionSetId }, ...options });
}
// How many questions a set has (the last position of a game).
function countBySet(questionSetId, options = {}) {
  return Question.count({ where: { question_set_id: questionSetId }, ...options });
}
module.exports = { findAndCountBySet, findInSet, create, update, remove, countGamesUsingSet, countBySet };