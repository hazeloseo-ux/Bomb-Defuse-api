// The rules for games: who may, when, and what if. No req, no res, no queries.
const gameSessionsRepository = require('../repositories/game-sessions.repository');
const questionSetRepository = require('../repositories/question-set.repository');
const questionRepository = require('../repositories/question.repository');
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

// Rule: only the host of this game may change it.
async function change(code, { status, current_position: position }, user) {
  const session = await findOrFail(code);
  if (session.host_id !== user.user_id) {
    throw forbidden('This game belongs to another host.');
  }
  if (status !== undefined) return changeStatus(session, status);
  return moveToQuestion(session, position);
}

// Rule: only an allowed status change. Starting a game starts question 1 and its timer.
function changeStatus(session, status) {
  if (!ALLOWED_CHANGES[session.status].includes(status)) {
    throw conflict(
      'INVALID_STATUS_CHANGE',
      `A game that is ${session.status} cannot become ${status}.`
    );
  }

  const now = new Date();
  const changes = { status };
  if (status === 'IN_PROGRESS') {
    changes.started_at = now;
    changes.current_position = 1;
    changes.question_started_at = now; // the server measures time from here, not the client
  }
  if (status === 'CLOSED') {
    changes.ended_at = now;
    // A game closed straight from WAITING still needs a start time for /results.
    if (!session.started_at) changes.started_at = now;
  }
  return gameSessionsRepository.update(session, changes);
}

// Rule: only the next question, and never after the last one.
async function moveToQuestion(session, position) {
  if (session.status !== 'IN_PROGRESS') {
    throw conflict('SESSION_NOT_RUNNING', 'Only a game that is IN_PROGRESS can move to another question.');
  }
  const total = await questionRepository.countBySet(session.question_set_id);
  if (session.current_position >= total) {
    throw conflict('NO_MORE_QUESTIONS', `Question ${total} was the last one.`);
  }
  if (position !== session.current_position + 1) {
    throw conflict('NOT_NEXT_QUESTION', `The next question is ${session.current_position + 1}.`);
  }
  return gameSessionsRepository.update(session, {
    current_position: position,
    question_started_at: new Date(),
  });
}
// Rule: only a running game has a current question. The position is decided by the server.
async function currentQuestion(code) {
  const session = await findOrFail(code);
  if (session.status !== 'IN_PROGRESS') {
    throw conflict('SESSION_NOT_RUNNING', 'This game is not running, so it has no current question.');
  }
  const question = await questionRepository.findByPosition(
    session.question_set_id,
    session.current_position
  );
  if (!question) {
    throw conflict('NO_CURRENT_QUESTION', `This game has no question at position ${session.current_position}.`);
  }
  return { session, question };
}

module.exports = { findOrFail, list, create, change, currentQuestion };