// One line per endpoint: verb + path, guard, rules, validate, controller.
const { Router } = require('express');
const requireUser = require('../middlewares/require-user');
const validate = require('../middlewares/validate');
const rules = require('../validators/game-sessions.validator');
const sessionController = require('../controllers/game-sessions.controller');
const playerController = require('../controllers/player.controller');
const answerController = require('../controllers/answer.controller');
const leaderboardController = require('../controllers/leaderboard.controller');

const router = Router();

router.get('/', requireUser('HOST'), sessionController.list);
router.post('/', requireUser('HOST'), rules.createRules, validate, sessionController.create);
router.get('/:code', requireUser(), rules.codeParam, validate, sessionController.get);
router.patch(
  '/:code',
  requireUser('HOST'),
  rules.statusRules,
  validate,
  sessionController.changeStatus
);

// Players are a part of a game, so their URLs sit under it.
router.post('/:code/players', requireUser(), rules.joinRules, validate, playerController.join);
router.get('/:code/players', requireUser(), rules.codeParam, validate, playerController.list);
router.get('/:code/question', requireUser(), rules.codeParam, validate, sessionController.currentQuestion);
router.post('/:code/answers', requireUser(), rules.answerRules, validate, answerController.submit);
router.get('/:code/leaderboard', requireUser(), rules.leaderboardRules, validate, leaderboardController.top);
module.exports = router;