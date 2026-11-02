// The rules for games: who may, when, and what if. No req, no res, no queries.
const gameSessionsRepository = require('../repositories/game-sessions.repository');
const questionSetRepository = require('../repositories/question-set.repository');
const { notFound, forbidden, conflict } = require('../errors/app-error');

// Which status may become which.
const ALLOWED_CHANGES = {
  WAITING: ['IN_PROGRESS', 'CLOSED'],
  IN_PROGRESS: ['CLOSED'],
  CLOSED: [],
};

function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // six digits, no leading 0
}

// The server makes the code. A client never chooses it.
async function makeUniqueCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = randomCode();
    if (!(await gameSessionsRepository.codeExists(code))) return code;
  }
  throw conflict('CODE_UNAVAILABLE', 'Could not make a join code. Please try again.');
}

async function findOrFail(code) {
  const session = await gameSessionsRepository.findByCode(code);
  if (!session) {
    throw notFound('SESSION_NOT_FOUND', `No game has the code ${code}.`);
  }
  return session;
}

function list(user) {
  return gameSessionsRepository.findAllByHost(user.user_id);
}

// Rule: the host is the caller, and the question set must be theirs.
async function create(data, user) {
  const questionSet = await questionSetRepository.findById(data.question_set_id);
  if (!questionSet) {
    throw notFound('QUESTION_SET_NOT_FOUND', `No question set has the id ${data.question_set_id}.`);
  }
  if (questionSet.host_id !== user.user_id) {
    throw forbidden('This question set belongs to another host.');
  }
  const join_code = await makeUniqueCode();
  return gameSessionsRepository.create({ ...data, host_id: user.user_id, join_code });
}

// Rule: only the host of this game, and only an allowed change.
async function changeStatus(code, status, user) {
  const session = await findOrFail(code);
  if (session.host_id !== user.user_id) {
    throw forbidden('This game belongs to another host.');
  }
  if (!ALLOWED_CHANGES[session.status].includes(status)) {
    throw conflict(
      'INVALID_STATUS_CHANGE',
      `A game that is ${session.status} cannot become ${status}.`
    );
  }

  const now = new Date();
  const changes = { status };
  if (status === 'IN_PROGRESS') changes.started_at = now;
  if (status === 'CLOSED') {
    changes.ended_at = now;
    // A game closed straight from WAITING still needs a start time for /results.
    if (!session.started_at) changes.started_at = now;
  }
  return gameSessionsRepository.update(session, changes);
}

module.exports = { findOrFail, list, create, changeStatus };