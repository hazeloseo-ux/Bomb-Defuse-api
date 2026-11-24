// The rules for answering, checked in this order: running (409), seated (403),
// the current question (409), a real choice (400). Then one transaction.
const { sequelize } = require('../models');
const gameSessionsService = require('./game-sessions.service');
const playerRepository = require('../repositories/player.repository');
const questionRepository = require('../repositories/question.repository');
const answerRepository = require('../repositories/answer.repository');
const { pointsFor } = require('../utils/points');
const { badRequest, forbidden, conflict } = require('../errors/app-error');

async function submit(code, { question_id: questionId, choice_index: choiceIndex }, user) {
  // 1. The game must be running.
  const session = await gameSessionsService.findOrFail(code);
  if (session.status !== 'IN_PROGRESS') {
    throw conflict('SESSION_NOT_RUNNING', 'This game is not running, so nobody can answer.');
  }

  // 2. The caller must have a seat in this game.
  const player = await playerRepository.findSeat(session.session_id, user.user_id);
  if (!player) {
    throw forbidden('You are not seated in this game.');
  }

  // 3. Only the current question can be answered.
  const question = await questionRepository.findByPosition(
    session.question_set_id,
    session.current_position
  );
  if (!question || question.question_id !== questionId) {
    throw conflict('NOT_CURRENT_QUESTION', 'That is not the current question.');
  }

  // 4. The choice must be one of this question's four choices.
  if (![0, 1, 2, 3].includes(choiceIndex)) {
    throw badRequest('INVALID_CHOICE', 'choice_index must be 0, 1, 2 or 3.');
  }

  // The server measures the time, never the client.
  const isCorrect = choiceIndex === question.correct_index;
  const elapsedMs = Date.now() - new Date(session.question_started_at).getTime();
  const points = pointsFor(question, isCorrect, elapsedMs);

  // All or nothing: the answer and the new score are saved together.
  // A second answer to the same question breaks uq_one_answer and is a 409 (see constraint-map.js).
  return sequelize.transaction(async (t) => {
    await answerRepository.create(
      {
        player_id: player.player_id,
        question_id: question.question_id,
        choice_index: choiceIndex,
        correct: isCorrect,
        points,
      },
      { transaction: t }
    );
    if (points > 0) await playerRepository.addScore(player, points, { transaction: t });
    await player.reload({ transaction: t });
    return { correct: isCorrect, points, score: player.score };
  });
}

module.exports = { submit };