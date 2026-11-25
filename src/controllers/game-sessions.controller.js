// Three steps: read validated input, call one service, choose the status.
const { matchedData } = require('express-validator');
const gameSessionsService = require('../services/game-sessions.service');

// What a client is allowed to see of a game.
function toJson(session) {
  return {
    code: session.join_code,
    status: session.status,
    question_set_id: session.question_set_id,
    host_id: session.host_id,
    time_limit_seconds: session.time_limit_seconds,
    started_at: session.started_at,
    ended_at: session.ended_at,
    current_position: session.current_position,
    question_started_at: session.question_started_at,
    created_at: session.created_at,
  };
}

async function list(req, res) {
  const sessions = await gameSessionsService.list(req.user);
  res.status(200).json(sessions.map(toJson));
}

async function create(req, res) {
  const data = matchedData(req, { locations: ['body'] });
  const session = await gameSessionsService.create(data, req.user);
  res.status(201).json(toJson(session));
}

async function get(req, res) {
  const { code } = matchedData(req);
  const session = await gameSessionsService.findOrFail(code);
  res.status(200).json(toJson(session));
}

async function changeStatus(req, res) {
  const { code, status, current_position } = matchedData(req);
  const session = await gameSessionsService.change(code, { status, current_position }, req.user);
  res.status(200).json(toJson(session));
}

// What a player may see of a question. correct_index is never sent.
function questionToJson(question, session) {
  return {
    id: question.question_id,
    position: session.current_position,
    question_type: question.question_type,
    question_text: question.question_text,
    choices: [question.choice_a, question.choice_b, question.choice_c, question.choice_d],
    question_started_at: session.question_started_at,
  };
}

async function currentQuestion(req, res) {
  const { code } = matchedData(req);
  const { session, question } = await gameSessionsService.currentQuestion(code);
  res.status(200).json(questionToJson(question, session));
}

module.exports = { toJson, list, create, get, changeStatus, currentQuestion };