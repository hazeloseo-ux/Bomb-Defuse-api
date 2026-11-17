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

## M3 · Gameplay

## M4 · Automated tests and server preparation

## M5 · API documentation and deployment

## M6 · The SE1 portfolio and the release

## M7 · The Test Report
