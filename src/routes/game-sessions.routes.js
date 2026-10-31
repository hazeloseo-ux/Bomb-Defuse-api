const { Router } = require('express');
const controller = require('../controllers/game-sessions.controller');

const router = Router();

router.get('/', controller.listGameSessions);

module.exports = router;
