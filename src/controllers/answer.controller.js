// Three steps: read validated input, call one service, choose the status.
const { matchedData } = require('express-validator');
const answerService = require('../services/answer.service');

async function submit(req, res) {
  const { code, question_id, choice_index } = matchedData(req);
  const result = await answerService.submit(code, { question_id, choice_index }, req.user);
  res.status(201).json(result);
}

module.exports = { submit };