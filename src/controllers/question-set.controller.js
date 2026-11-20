// Three steps: read validated input, call one service, choose the status.
const { matchedData } = require('express-validator');
const questionSetService = require('../services/question-set.service');
const { envelope } = require('../utils/paginate');
const { toJson: questionToJson } = require('./question.controller');

// What a client is allowed to see of a question set.
function toJson(questionSet, { withQuestions = false } = {}) {
  const json = {
    id: questionSet.question_set_id,
    title: questionSet.title,
    description: questionSet.description,
    host_id: questionSet.host_id,
    created_at: questionSet.created_at,
        cover_url: questionSet.cover_filename ? `/uploads/covers/${questionSet.cover_filename}` : null,
  };
  if (withQuestions) json.questions = questionSet.questions.map(questionToJson);
  return json;
}

async function list(req, res) {
  const paging = matchedData(req, { locations: ['query'] }); // page, limit, q, sort, order
  const { rows, count } = await questionSetService.list(req.user, paging);
  res.status(200).json(envelope(rows.map((row) => toJson(row)), count, paging));
}

async function get(req, res) {
  const { id, include } = matchedData(req);
  const withQuestions = include === 'questions';
  const questionSet = await questionSetService.get(id, req.user, { withQuestions });
  res.status(200).json(toJson(questionSet, { withQuestions }));
}

async function create(req, res) {
  const data = matchedData(req, { locations: ['body'] });
  const questionSet = await questionSetService.create(data, req.user);
  res.status(201).json(toJson(questionSet));
}

async function update(req, res) {
  const { id, ...changes } = matchedData(req);
  const questionSet = await questionSetService.update(id, changes, req.user);
  res.status(200).json(toJson(questionSet));
}

async function remove(req, res) {
  const { id } = matchedData(req);
  await questionSetService.remove(id, req.user);
  res.status(204).end();
}
async function uploadCover(req, res) {
  const { id } = matchedData(req);
  const questionSet = await questionSetService.setCover(id, req.file, req.user);
  res.status(200).json(toJson(questionSet));
}
module.exports = { list, get, create, update, remove, uploadCover };