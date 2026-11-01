# Bomb-Defuse API

Backend API for **Bomb-Defuse**, a tournament game for the SorSU Bulan Campus library.
CS 313 Software Engineering 1, A.Y. 2026-2027.

- Developer: Hazel Ann Oseo (hazeloseo-ux), BSCS 3-1 
- Group and game concept: [Group 9, Bomb Defuse]

This is my own build of my group's game concept. Every commit in this repository was made by me, with Git, on my own computer or in my own Codespace.

## Tech stack

| Layer | Tool |
|---|---|
| Runtime | Node.js 22 LTS or newer |
| Web framework | Express 5 |
| Database | PostgreSQL 16 or newer |
| ORM and migrations | Sequelize 6 with sequelize-cli |

## Setup

```
git clone [https://github.com/hazeloseo-ux/Bomb-Defuse-api.git]
cd [Bomb-Defuse-api]
npm install
```

Copy `.env.example` to `.env`, then put your own PostgreSQL password in `DB_PASSWORD`.

```
npm run db:create     (first time only)
npm run db:migrate
npm run db:seed
npm run db:check
npm run dev
```

## Environment variables

| Key | Example | Purpose |
|---|---|---|
| NODE_ENV | development | Which config block to use |
| PORT | 3001 | Port the API listens on (the library assigns the final port at deployment) |
| DB_HOST | 127.0.0.1 | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_NAME | your_game_slug | Database name: your game slug, with underscores |
| DB_USER | postgres | Database user |
| DB_PASSWORD | (your own) | Database password. Never commit this. |
| HUB_API_KEY | dev-hub-key | Key the Library Game Hub sends to read results. The library gives the real one at deployment. |

## Endpoints

Base URL: `http://localhost:3001/api/v1`

Every error uses one shape: `{ "error": { "code": "...", "message": "..." } }`. A request that fails validation also carries `details`, a list of every problem.

Until Week 12 the caller is named by the `X-Demo-User` header (a school ID from the seed data). This is a stand-in, not security. The Library Game Hub sends `X-Hub-Key` instead.

### Hub Contract v1.2

| Method | Path | Who may call it | Purpose | Success |
|---|---|---|---|---|
| GET | /health | Anyone | Is the API up and can it reach the database? | 200 (503 when the database is down) |
| GET | /game-info | Anyone | Slug, name, group, developer, description, player limits, version | 200 |
| GET | /results | The Hub, with `X-Hub-Key` | Closed games, every player, and the top 3. Optional `?since=` | 200 (401 without the key) |

### Question sets (hosts only, and only the owner)

| Method | Path | Purpose | Success | Can fail with |
|---|---|---|---|---|
| GET | /question-sets | List my question sets | 200 | 401, 403 |
| POST | /question-sets | Create one. The owner is always the caller | 201 | 400, 401, 403 |
| GET | /question-sets/{id} | Read one | 200 | 400, 403, 404 |
| PATCH | /question-sets/{id} | Change title or description | 200 | 400, 403, 404 |
| DELETE | /question-sets/{id} | Delete one | 204 | 400, 403, 404, 409 QUESTION_SET_IN_USE |

### Game sessions and players

| Method | Path | Who may call it | Purpose | Success | Can fail with |
|---|---|---|---|---|---|
| GET | /game-sessions | HOST | List my games, newest first | 200 | 401, 403 |
| POST | /game-sessions | HOST | Start a game. The server makes the six-digit code | 201 | 400, 403, 404 |
| GET | /game-sessions/{code} | Anyone | Read a game by its code | 200 | 400, 404 |
| PATCH | /game-sessions/{code} | HOST who owns the game | Move the status to IN_PROGRESS or CLOSED | 200 | 400, 403, 404, 409 INVALID_STATUS_CHANGE |
| POST | /game-sessions/{code}/players | Any known account | Join a game, or rejoin it | 201 new seat, 200 same seat | 400, 401, 404, 409 |
| GET | /game-sessions/{code}/players | Anyone | List the players and their scores | 200 | 400, 404 |

A game moves forward only: WAITING to IN_PROGRESS to CLOSED, or WAITING straight to CLOSED. Closing a game makes it appear in `/results`.

### Joining a game: the questions, in this order

1. Is the account known? If not, 401 AUTH_REQUIRED.
2. Is the nickname 2 to 50 characters? If not, 400 VALIDATION_FAILED.
3. Does a game with this code exist? If not, 404 SESSION_NOT_FOUND.
4. Does this account already have a seat here? Then 200 with the same seat and score (rejoin).
5. Does this account have a seat in another game that is IN_PROGRESS? Then 409 ALREADY_IN_GAME (one game at a time).
6. Is the game still WAITING? If not, 409 SESSION_NOT_JOINABLE, or SESSION_ENDED when it is CLOSED.
7. Is the nickname free? The database decides, so two requests at the same instant cannot both win. If not, 409 NICKNAME_TAKEN.

### Testing

The Postman collection is in `postman/bomb-defuse-week11.postman_collection.json`. It has 40 requests with tests. Test accounts (X-Demo-User): host `2099-0001`, second host `2099-0007`, player `2099-0002`, a player not seated anywhere `2099-0006`. Run `npm run db:reset` before running the collection.

## What "completed" means in my game

[A player completed the game when they reached 5 successful wire cuts
(players.defuse_progress = 5) before the timer ran out and before reaching
3 mistakes (players.mistakes < 3). A player who reached 3 mistakes (the bomb
exploded) or who left before cutting all 5 wires did not complete the game.]

## Tables

| Table | What it stores |
|---|---|
| users | Accounts (hosts and players): school_id, username, full_name, email, password_hash, role (HOST or PLAYER) |
| question_sets | A host's set of questions: title, description, host_id |
| questions | Multiple-choice questions (tool-earning or wire-cutting): text, choices A to D, correct_index |
| game_sessions | One game: 6-digit join_code, status (WAITING, IN_PROGRESS, CLOSED), time_limit_seconds, started_at, ended_at |
| players | One seat per account per game: nickname, score, defuse_progress (0 to 5), mistakes (0 to 3) |
| answers | Each submitted answer: choice_index, correct, points |
| defuse_steps | The 5 wire-cutting steps of each player: step_number, description, completed |

## Database scripts

| Command | What it does |
|---|---|
| npm run db:migrate | Runs migrations that have not run yet |
| npm run db:migrate:status | Lists every migration as up or down |
| npm run db:seed | Loads the seed data |
| npm run db:check | Counts the rows in every table |
| npm run db:reset | Empties the database, rebuilds every table and reloads the seed data |
| npm run check | Runs the same automatic check that GitHub runs after every push |