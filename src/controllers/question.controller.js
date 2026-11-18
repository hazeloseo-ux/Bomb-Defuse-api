// Three steps: read validated input, call one service, choose the status.
const { matchedData } = require('express-validator');
const questionService = require('../services/question.service');
const { envelope } = require('../utils/paginate');

// Only the owner reaches these endpoints, so correct_index may be shown.
function toJson(question) {
  return {
    id: question.question_id,
    question_set_id: question.question_set_id,
    question_type: question.question_type,
    question_text: question.question_text,
    choices: [question.choice_a, question.choice_b, question.choice_c, question.choice_d],
    correct_index: question.correct_index,
  };
}

async function list(req, res) {
  const { id, ...paging } = matchedData(req); // id from the URL, page and limit from the query
  const { rows, count } = await questionService.list(id, paging, req.user);
  res.status(200).json(envelope(rows.map(toJson), count, paging));
}

async function create(req, res) {
  const { id } = matchedData(req, { locations: ['params'] });
  const data = matchedData(req, { locations: ['body'] });
  const question = await questionService.create(id, data, req.user);
  res.status(201).json(toJson(question));
}

async function update(req, res) {
  const { id, questionId } = matchedData(req, { locations: ['params'] });
  const changes = matchedData(req, { locations: ['body'] });
  const question = await questionService.update(id, questionId, changes, req.user);
  res.status(200).json(toJson(question));
}

async function remove(req, res) {
  const { id, questionId } = matchedData(req, { locations: ['params'] });
  await questionService.remove(id, questionId, req.user);
  res.status(204).end();
}

module.exports = { list, create, update, remove, toJson };