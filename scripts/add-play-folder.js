// Adds the folder "Play a whole game" to the Postman collection.
// Run it again any time: it replaces the old folder instead of adding a second one.
const fs = require('fs');
const path = require('path');
const questionRepository = require('../src/repositories/question.repository');

const FILE = path.join(__dirname, '..', 'postman', 'bomb-defuse.postman_collection.json');
const FOLDER = 'Play a whole game';
const SET_ID = 1; // the demo set (usedSetId)

const JSON_HEADER = { key: 'Content-Type', value: 'application/json' };
const as = (token) => [{ key: 'Authorization', value: 'Bearer {{' + token + '}}' }];

const status = (code) =>
  'pm.test("status is ' + code + '", function () { pm.response.to.have.status(' + code + '); });';
const errorCode = (code) =>
  'pm.test("error code is ' + code + '", function () { pm.expect(pm.response.json().error.code).to.eql("' + code + '"); });';

function item(name, method, headers, urlPath, body, tests, pre) {
  const parts = urlPath.split('?');
  const url = { raw: '{{baseUrl}}' + urlPath, host: ['{{baseUrl}}'], path: parts[0].split('/').filter(Boolean) };
  if (parts[1]) {
    url.query = parts[1].split('&').map((pair) => {
      const kv = pair.split('=');
      return { key: kv[0], value: kv[1] };
    });
  }
  const request = { method, header: [...headers], url };
  if (body !== null) {
    request.header.push(JSON_HEADER);
    request.body = { mode: 'raw', raw: body, options: { raw: { language: 'json' } } };
  }
  const event = [];
  if (pre) event.push({ listen: 'prerequest', script: { type: 'text/javascript', exec: pre } });
  event.push({ listen: 'test', script: { type: 'text/javascript', exec: tests } });
  return { name, event, request };
}

const setVar = (name, expr) => 'pm.collectionVariables.set("' + name + '", ' + expr + ');';

// Before the request: find the right choice (or a wrong one) of the current question.
const preChoice = (wrong) => [
  'const map = JSON.parse(pm.collectionVariables.get("wgQuestions"));',
  'const right = Number(map[pm.collectionVariables.get("wgQid")]);',
  setVar('wgChoice', wrong ? 'String((right + 1) % 4)' : 'String(right)'),
];

const answerBody = '{\n  "question_id": {{wgQid}},\n  "choice_index": {{wgChoice}}\n}';
const CODE = '/game-sessions/{{wgCode}}';

async function main() {
  const total = await questionRepository.countBySet(SET_ID);
  if (total < 2) throw new Error('The demo set needs at least 2 questions.');

  const items = [];
  const add = (...args) => items.push(item(...args));

  add('P-01 Host starts a new game from the demo set - 201', 'POST', as('hostToken'), '/game-sessions',
    '{\n  "question_set_id": {{usedSetId}}\n}', [
      status(201),
      'const body = pm.response.json();',
      'pm.test("the server made a six digit code", function () { pm.expect(body.code).to.match(/^[1-9][0-9]{5}$/); });',
      setVar('wgCode', 'body.code'),
      setVar('wgSince', 'new Date(Date.now() - 60000).toISOString()'),
    ]);

  add('P-02 Host reads the set with its questions - 200, one query', 'GET', as('hostToken'),
    '/question-sets/{{usedSetId}}?include=questions', null, [
      status(200),
      'const body = pm.response.json();',
      'pm.test("the set has questions", function () { pm.expect(body.questions).to.be.an("array").that.is.not.empty; });',
      'const map = {};',
      'body.questions.forEach(function (q) { map[q.id] = q.correct_index; });',
      setVar('wgQuestions', 'JSON.stringify(map)'),
      setVar('wgFirstQid', 'String(body.questions[0].id)'),
    ]);

  add('P-03 Rina joins - 201', 'POST', as('playerToken'), CODE + '/players', '{\n  "nickname": "Rina"\n}',
    [status(201)]);
  add('P-04 Lito joins - 201', 'POST', as('litoToken'), CODE + '/players', '{\n  "nickname": "Lito"\n}',
    [status(201)]);

  add('P-05 Question before the game starts - 409 SESSION_NOT_RUNNING', 'GET', as('playerToken'),
    CODE + '/question', null, [status(409), errorCode('SESSION_NOT_RUNNING')]);
  add('P-06 Answer before the game starts - 409 SESSION_NOT_RUNNING', 'POST', as('playerToken'),
    CODE + '/answers', '{\n  "question_id": {{wgFirstQid}},\n  "choice_index": 0\n}',
    [status(409), errorCode('SESSION_NOT_RUNNING')]);

  add('P-07 Host starts the game - 200, question 1', 'PATCH', as('hostToken'), CODE,
    '{\n  "status": "IN_PROGRESS"\n}', [
      status(200),
      'const body = pm.response.json();',
      'pm.test("running at question 1", function () { pm.expect(body.status).to.eql("IN_PROGRESS"); pm.expect(body.current_position).to.eql(1); });',
    ]);

  add('P-08 A player who is not seated answers - 403', 'POST', as('maraToken'), CODE + '/answers',
    '{\n  "question_id": {{wgFirstQid}},\n  "choice_index": 0\n}', [status(403)]);

  for (let i = 1; i <= total; i += 1) {
    const n = String(i);
    add('P-Q' + n + 'a Rina reads question ' + n + ' - 200, never correct_index', 'GET', as('playerToken'),
      CODE + '/question', null, [
        status(200),
        'const body = pm.response.json();',
        'pm.test("it is question ' + n + ' with four choices", function () { pm.expect(body.position).to.eql(' + n + '); pm.expect(body.choices).to.have.lengthOf(4); });',
        'pm.test("the answer is never shown", function () { pm.expect(JSON.stringify(body)).to.not.include("correct_index"); });',
        setVar('wgQid', 'String(body.id)'),
      ]);

    if (i === 1) {
      add('P-Q1x Lito answers a question that is not the current one - 409', 'POST', as('litoToken'),
        CODE + '/answers', '{\n  "question_id": {{wgWrongQid}},\n  "choice_index": 0\n}',
        [status(409), errorCode('NOT_CURRENT_QUESTION')],
        [setVar('wgWrongQid', 'String(Number(pm.collectionVariables.get("wgQid")) + 100000)')]);
      add('P-Q1y Lito sends a choice that does not exist - 400', 'POST', as('litoToken'),
        CODE + '/answers', '{\n  "question_id": {{wgQid}},\n  "choice_index": 9\n}',
        [status(400), errorCode('INVALID_CHOICE')]);
    }

    add('P-Q' + n + 'b Rina answers question ' + n + ' correctly - 201', 'POST', as('playerToken'),
      CODE + '/answers', answerBody, [
        status(201),
        'const body = pm.response.json();',
        'pm.test("correct, with points and a score", function () { pm.expect(body.correct).to.eql(true); pm.expect(body.points).to.be.at.least(100); pm.expect(body.score).to.be.at.least(body.points); });',
      ], preChoice(false));

    if (i === 1) {
      add('P-Q1z Rina answers question 1 again - 409 ALREADY_ANSWERED', 'POST', as('playerToken'),
        CODE + '/answers', answerBody, [status(409), errorCode('ALREADY_ANSWERED')], preChoice(false));
    }

    if (i < total) {
      add('P-Q' + n + 'c Lito answers question ' + n + ' wrongly - 201, 0 points', 'POST', as('litoToken'),
        CODE + '/answers', answerBody, [
          status(201),
          'const body = pm.response.json();',
          'pm.test("wrong answer, no points", function () { pm.expect(body.correct).to.eql(false); pm.expect(body.points).to.eql(0); });',
        ], preChoice(true));
    }

    if (i === 1) {
      add('P-Q1s Host skips a question - 409 NOT_NEXT_QUESTION', 'PATCH', as('hostToken'), CODE,
        '{\n  "current_position": 3\n}', [status(409), errorCode('NOT_NEXT_QUESTION')]);
    }

    if (i < total) {
      add('P-Q' + n + 'n Host moves to question ' + (i + 1) + ' - 200', 'PATCH', as('hostToken'), CODE,
        '{\n  "current_position": ' + (i + 1) + '\n}', [
          status(200),
          'pm.test("now at question ' + (i + 1) + '", function () { pm.expect(pm.response.json().current_position).to.eql(' + (i + 1) + '); });',
        ]);
    }
  }

  add('P-90 Host moves past the last question - 409 NO_MORE_QUESTIONS', 'PATCH', as('hostToken'), CODE,
    '{\n  "current_position": ' + (total + 1) + '\n}', [status(409), errorCode('NO_MORE_QUESTIONS')]);
  add('P-91 Host closes the game - 200 CLOSED', 'PATCH', as('hostToken'), CODE, '{\n  "status": "CLOSED"\n}', [
    status(200),
    'pm.test("closed", function () { pm.expect(pm.response.json().status).to.eql("CLOSED"); });',
  ]);
  add('P-92 Answer after the game closed - 409 SESSION_NOT_RUNNING', 'POST', as('playerToken'),
    CODE + '/answers', '{\n  "question_id": {{wgQid}},\n  "choice_index": 0\n}',
    [status(409), errorCode('SESSION_NOT_RUNNING')]);

  add('P-93 Leaderboard - 200, Rina first, Lito second', 'GET', as('playerToken'),
    CODE + '/leaderboard?limit=10', null, [
      status(200),
      'const body = pm.response.json();',
      'pm.test("Rina is rank 1 and Lito is behind her", function () { pm.expect(body[0].nickname).to.eql("Rina"); pm.expect(body[0].rank).to.eql(1); pm.expect(body[1].nickname).to.eql("Lito"); pm.expect(body[1].rank).to.eql(2); pm.expect(body[0].score).to.be.above(body[1].score); });',
    ]);
  add('P-94 Leaderboard with limit=1 - 200, one player', 'GET', as('playerToken'),
    CODE + '/leaderboard?limit=1', null, [
      status(200),
      'pm.test("only one player", function () { pm.expect(pm.response.json()).to.have.lengthOf(1); });',
    ]);
  add('P-95 Leaderboard with limit=0 - 400', 'GET', as('playerToken'),
    CODE + '/leaderboard?limit=0', null, [status(400), errorCode('VALIDATION_FAILED')]);

  add('P-96 /results?since= with the Hub key - 200, the game just played', 'GET',
    [{ key: 'X-Hub-Key', value: '{{hubKey}}' }], '/results?since={{wgSince}}', null, [
      status(200),
      'const body = pm.response.json();',
      'const game = body.results.find(function (g) { return g.session_code === pm.collectionVariables.get("wgCode"); });',
      'pm.test("the game that was just played is listed", function () { pm.expect(game).to.be.an("object"); });',
      'const rina = game.players.find(function (p) { return p.nickname === "Rina"; });',
      'const lito = game.players.find(function (p) { return p.nickname === "Lito"; });',
      'pm.test("Rina answered every question: completed, rank 1", function () { pm.expect(rina.completed).to.eql(true); pm.expect(rina.rank).to.eql(1); });',
      'pm.test("Lito skipped the last question: not completed, no rank", function () { pm.expect(lito.completed).to.eql(false); pm.expect(lito.rank).to.eql(null); });',
    ]);

  const collection = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  collection.item = collection.item.filter((entry) => entry.name !== FOLDER);
  collection.item.push({ name: FOLDER, item: items });

  collection.variable = collection.variable || [];
  ['wgCode', 'wgSince', 'wgQuestions', 'wgFirstQid', 'wgQid', 'wgWrongQid', 'wgChoice'].forEach((key) => {
    if (!collection.variable.some((v) => v.key === key)) collection.variable.push({ key, value: '' });
  });

  fs.writeFileSync(FILE, JSON.stringify(collection, null, 2));
  const count = (list) => list.reduce((sum, e) => sum + (e.item ? count(e.item) : 1), 0);
  console.log('Folder "' + FOLDER + '": ' + items.length + ' requests. Collection total: ' + count(collection.item));
}

main()
  .catch((error) => console.log('ERROR:', error.message))
  .finally(() => process.exit());