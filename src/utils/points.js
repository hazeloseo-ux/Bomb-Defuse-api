// Pure scoring rule: no database, no clock, no req. Easy to unit test.
const BASE_POINTS = 100; // a correct answer is always worth this much
const MAX_SPEED_BONUS = 50; // extra points for a very fast correct answer
const BONUS_WINDOW_MS = 30000; // the bonus shrinks to 0 over this many milliseconds

// elapsedMs = time from question_started_at to the answer, measured by the server.
function pointsFor(question, isCorrect, elapsedMs) {
  if (!isCorrect) return 0;
  const elapsed = Math.min(Math.max(Number(elapsedMs) || 0, 0), BONUS_WINDOW_MS);
  const bonus = Math.round(MAX_SPEED_BONUS * (1 - elapsed / BONUS_WINDOW_MS));
  return BASE_POINTS + bonus;
}

module.exports = { pointsFor, BASE_POINTS, MAX_SPEED_BONUS, BONUS_WINDOW_MS };