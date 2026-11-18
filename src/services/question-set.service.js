// The rules: missing is 404, only the owner may touch a set, the owner is the caller.
const questionSetRepository = require('../repositories/question-set.repository');
const { notFound, forbidden } = require('../errors/app-error');

async function findOrFail(id, options) {
  const questionSet = await questionSetRepository.findById(id, options);
  if (!questionSet) {
    throw notFound('QUESTION_SET_NOT_FOUND', `No question set has the id ${id}.`);
  }
  return questionSet;
}

function assertOwner(questionSet, user) {
  if (questionSet.host_id !== user.user_id) {
    throw forbidden('This question set belongs to another host.');
  }
}

// The caller only ever sees their own sets. paging holds page, limit, q, sort, order.
function list(user, paging) {
  return questionSetRepository.findAndCountByHost(user.user_id, paging);
}

async function get(id, user, options) {
  const questionSet = await findOrFail(id, options);
  assertOwner(questionSet, user);
  return questionSet;
}

// The owner is the caller. A client never chooses it.
function create(data, user) {
  return questionSetRepository.create({ ...data, host_id: user.user_id });
}

async function update(id, changes, user) {
  const questionSet = await findOrFail(id);
  assertOwner(questionSet, user);
  return questionSetRepository.update(questionSet, changes);
}

async function remove(id, user) {
  const questionSet = await findOrFail(id);
  assertOwner(questionSet, user);
  await questionSetRepository.remove(questionSet);
}

module.exports = { list, get, create, update, remove };