// The rules for questions inside a set:
//   the set must exist (404), only its owner may touch it (403),
//   a set already used by a game is frozen (409), the question must be in this set (404).
const { sequelize } = require('../models');
const questionRepository = require('../repositories/question.repository');
const questionSetService = require('./question-set.service');
const { notFound, conflict } = require('../errors/app-error');

// questionSetService.get already does "404 if missing, 403 if not the owner".
function loadOwnedSet(setId, user) {
  return questionSetService.get(setId, user);
}

async function assertNotFrozen(setId, t) {
  const games = await questionRepository.countGamesUsingSet(setId, { transaction: t });
  if (games > 0) {
    throw conflict('QUESTION_SET_IN_USE', 'A game already uses this set, so its questions cannot change.');
  }
}

// The client sends choices as a list. The table has four columns.
function toColumns({ choices, ...rest }) {
  const columns = { ...rest };
  if (choices) {
    [columns.choice_a, columns.choice_b, columns.choice_c, columns.choice_d] = choices;
  }
  return columns;
}

async function list(setId, paging, user) {
  await loadOwnedSet(setId, user);
  return questionRepository.findAndCountBySet(setId, paging);
}

// All or nothing: the "is it frozen?" check and the insert happen in one transaction.
function create(setId, data, user) {
  return sequelize.transaction(async (t) => {
    await loadOwnedSet(setId, user);
    await assertNotFrozen(setId, t);
    // question_set_id comes last, so a client can never choose it.
    return questionRepository.create(
      { ...toColumns(data), question_set_id: setId },
      { transaction: t }
    );
  });
}

async function findOrFail(setId, questionId, t) {
  const question = await questionRepository.findInSet(setId, questionId, { transaction: t });
  if (!question) {
    throw notFound('QUESTION_NOT_FOUND', `Set ${setId} has no question with the id ${questionId}.`);
  }
  return question;
}

function update(setId, questionId, changes, user) {
  return sequelize.transaction(async (t) => {
    await loadOwnedSet(setId, user);
    await assertNotFrozen(setId, t);
    const question = await findOrFail(setId, questionId, t);
    return questionRepository.update(question, toColumns(changes), { transaction: t });
  });
}

function remove(setId, questionId, user) {
  return sequelize.transaction(async (t) => {
    await loadOwnedSet(setId, user);
    await assertNotFrozen(setId, t);
    const question = await findOrFail(setId, questionId, t);
    await questionRepository.remove(question, { transaction: t });
  });
}

module.exports = { list, create, update, remove };