# Development journey: Bomb Defuse API

Student: Hazel Ann Oseo · Section: 3-1 · Group: 9

One entry per milestone, written the week you did it. Newest at the bottom.

## M1 · Accounts, passwords and tokens
- Dates worked: Nov 15 to Nov 17, 2026 · Time spent: about 6 hours (2 hours a day for 3 days).
- Goal: Let people register and log in with a password, and protect routes with a token.
- What I built: /auth/register, /auth/login, /auth/me, and admin-only /users and /users/:id/role. Passwords are bcrypt hashes, login returns a JWT, and a new account is always a PLAYER. The Postman collection has 78 requests.
- Evidence: https://github.com/hazeloseo-ux/Bomb-Defuse-api/pull/4 · f970ef0 · 3acea4d · 7be26b6
- Problem I hit: For a long time I did not understand JWT_SECRET and the .env file. I pasted the wrong things into .env, and one line became "JWT_SECRET=JWT_SECRET=".
- How I solved it: I learned that .env holds the secret that signs tokens and it must never be committed. I removed the bad lines, added a random 64-character key with a small Node command, and checked its length was 64.
- Decision I made and why: A wrong password and an unknown school ID both answer the same 401. A user is not told which part was wrong, but nobody can guess which school IDs have accounts.
- Changes to my design set: users.role now accepts ADMIN, and users has a password_hash column.
- What I would explain to a classmate: We never store the real password, only its bcrypt hash. At login we hash what the person typed and compare the two.
- AI use: I used (an AI) to ask for help, to get step-by-step guidance, and to have parts explained to me. It suggested some code and commands. I ran, tested and checked them myself (npm run check, Postman, newman). I am still learning how they work

## M2 · The question bank
- Dates worked: Nov 18, 20 and 22, 2026 · Time spent: about 6 hours (2 hours a day for 3 days)
- Goal: Let hosts list their question sets with paging, search and sort, keep questions inside a set, and add a cover picture.
- What I built: Paging, ?q search and allow-listed sort on GET /question-sets, answered as { data, meta }. GET/POST /question-sets/:id/questions and PATCH/DELETE /question-sets/:id/questions/:questionId (owner only, one correct_index, a set used by a game is frozen, saved in a transaction). GET /question-sets/:id?include=questions in one query. PUT /question-sets/:id/cover for one PNG or JPEG up to 1 MB. A Question model, a cover_filename migration, and a Postman folder "Question bank" (94 requests in the collection).
- Evidence: https://github.com/hazeloseo-ux/Bomb-Defuse-api/pull/5 · d8b1bdc · a23ae9e · 354c808
- Problem I hit: GET /question-sets/1/questions answered 403 "belongs to another host" even though I own the set. The list function in my question service still had the old arguments, so the paging object was read as the user.
- How I solved it: I compared the controller call with the service function, saw that the arguments did not match, changed the service to list(setId, paging, user), and tested again. It answered 200.
- Decision I made and why: A question's position is the order of its question_id, so I did not add a position column. This keeps the table as designed, but a question cannot be moved. I also made the server delete an uploaded picture when the caller is not the owner, so no unused files stay in uploads.
- Changes to my design set: Questions are now an endpoint under a set, and question_sets has a nullable cover_filename column. I did not add a position column. The "too big" upload test is not in Postman, because the kit has no file over 1 MB; the API itself answers 413.
- What I would explain to a classmate: ?sort cannot be a plain parameter in SQL, so it must be one of a fixed list. That is why ?sort=password answers 400.
- AI use: Same as M1. I used an AI assistant to ask for help, to get step-by-step guidance, and to have parts explained to me. I ran, tested and checked the code myself, and I am still learning how it works.

## M3 · Gameplay

## M4 · Automated tests and server preparation

## M5 · API documentation and deployment

## M6 · The SE1 portfolio and the release

## M7 · The Test Report
