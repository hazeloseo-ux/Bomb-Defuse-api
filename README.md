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
git clone [repository-url]
cd [folder-name]
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

## Endpoints (Hub Contract v1.2)

Base URL: `http://localhost:3001/api/v1`

| Method | Path | Purpose | Success |
|---|---|---|---|
| GET | /health | Is the API up and can it reach the database? | 200 (503 when the database is down) |
| GET | /game-info | Slug, name, group, developer, description, player limits, version | 200 |
| GET | /results | Finished games, every player, and the top 3. Needs the `X-Hub-Key` header. Optional `?since=` | 200 (401 without the key) |

## What "completed" means in my game

[A player completed the game when they reached 5 successful wire cuts
(players.defuse_progress = 5) before the timer ran out and before reaching
3 mistakes (players.mistakes < 3). A player who reached 3 mistakes (the bomb
exploded) or who left before cutting all 5 wires did not complete the game.]

## Tables

[| Table | What it stores |
|---|---|
| users | Accounts (hosts and players): school_id, username, full_name, email, password_hash, role (HOST or PLAYER) |
| question_sets | A host's set of questions: title, description, host_id |
| questions | Multiple-choice questions (tool-earning or wire-cutting): text, choices A to D, correct_index |
| game_sessions | One game: 6-digit join_code, status (WAITING, IN_PROGRESS, CLOSED), time_limit_seconds, started_at, ended_at |
| players | One seat per account per game: nickname, score, defuse_progress (0 to 5), mistakes (0 to 3) |
| answers | Each submitted answer: choice_index, correct, points |
| defuse_steps | The 5 wire-cutting steps of each player: step_number, description, completed |]
## Database scripts

| Command | What it does |
|---|---|
| npm run db:migrate | Runs migrations that have not run yet |
| npm run db:migrate:status | Lists every migration as up or down |
| npm run db:seed | Loads the seed data |
| npm run db:check | Counts the rows in every table |
| npm run db:reset | Empties the database, rebuilds every table and reloads the seed data |
| npm run check | Runs the same automatic check that GitHub runs after every push |
