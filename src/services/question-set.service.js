// The rules: missing is 404, only the owner may touch a set, the owner is the caller.
const fs = require('fs/promises');
const path = require('path');

const COVERS_DIR = path.join(__dirname, '..', '..', 'uploads', 'covers');

// Best effort: a leftover file must never break the request.
function removeCover(filename) {
  return fs.unlink(path.join(COVERS_DIR, filename)).catch(() => {});
}
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
// The picture is already on disk when we get here (multer ran first).
// If the caller is not the owner, or the set does not exist, delete it again.
async function setCover(id, file, user) {
  try {
    const questionSet = await findOrFail(id);
    assertOwner(questionSet, user);
    const oldFilename = questionSet.cover_filename;
    const updated = await questionSetRepository.update(questionSet, { cover_filename: file.filename });
    if (oldFilename) await removeCover(oldFilename); // replaced, so the old picture goes
    return updated;
  } catch (error) {
    await removeCover(file.filename);
    throw error;
  }
}
module.exports = { list, get, create, update, remove, setCover };