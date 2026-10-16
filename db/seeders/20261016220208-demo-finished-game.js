'use strict';

// "completed" in this game = the player reached 5 successful wire cuts (defuse_progress = 5)
module.exports = {
  async up(queryInterface) {
    const db = queryInterface.sequelize;
    const one = async (sql) => (await db.query(sql))[0][0];

    // 1. find the parents that earlier seeders created (never type an ID)
    const host = await one("SELECT user_id FROM users WHERE school_id = '2099-0001'");
    const set = await one("SELECT question_set_id FROM question_sets WHERE title = 'Demo Bomb Defuse Basics'");

    // 2. a game that has ENDED
    await queryInterface.bulkInsert('game_sessions', [{
      host_id: host.user_id, question_set_id: set.question_set_id, join_code: '482913',
      status: 'CLOSED', time_limit_seconds: 300,
      started_at: new Date('2026-10-09T01:00:00Z'), ended_at: new Date('2026-10-09T01:05:00Z'),
    }]);
    const game = await one("SELECT session_id FROM game_sessions WHERE join_code = '482913'");

    // 3. its players: three completed (a three-way tie), one who exploded the bomb
    const seats = [
      { school: '2099-0002', nick: 'Rina', score: 1500, progress: 5, mistakes: 0 },
      { school: '2099-0003', nick: 'Dale', score: 1500, progress: 5, mistakes: 1 },
      { school: '2099-0004', nick: 'Pao',  score: 1500, progress: 5, mistakes: 2 },
      { school: '2099-0005', nick: 'Lito', score: 400,  progress: 2, mistakes: 3 }, // left early: bomb exploded
    ];
    for (const s of seats) {
      const u = await one(`SELECT user_id FROM users WHERE school_id = '${s.school}'`);
      await queryInterface.bulkInsert('players', [{
        session_id: game.session_id, user_id: u.user_id, nickname: s.nick,
        score: s.score, defuse_progress: s.progress, mistakes: s.mistakes,
      }]);
    }

    // 4. what each player answered and which defuse steps they finished
    const [questions] = await db.query(
      `SELECT question_id, question_type, correct_index FROM questions WHERE question_set_id = ${set.question_set_id} ORDER BY question_id`);
    for (const s of seats) {
      const p = await one(`SELECT player_id FROM players WHERE session_id = ${game.session_id} AND nickname = '${s.nick}'`);
      const answers = [];
      // correct answers: 5 tool + 5 cut for winners, 2 + 2 for the player who left early
      const wanted = s.progress;
      let tool = 0, cut = 0;
      for (const q of questions) {
        const isTool = q.question_type === 'TOOL';
        if ((isTool && tool >= wanted) || (!isTool && cut >= wanted)) continue;
        isTool ? tool++ : cut++;
        answers.push({ player_id: p.player_id, question_id: q.question_id, choice_index: q.correct_index, correct: true, points: 100 });
      }
      // wrong cut answers add to the mistake counter and earn 0 points
      const cuts = questions.filter((q) => q.question_type === 'CUT');
      for (let m = 0; m < s.mistakes; m++) {
        const q = cuts[m];
        answers.push({ player_id: p.player_id, question_id: q.question_id, choice_index: (q.correct_index + 1) % 4, correct: false, points: 0 });
      }
      await queryInterface.bulkInsert('answers', answers);

      const steps = [];
      for (let n = 1; n <= 5; n++) {
        const done = n <= s.progress;
        steps.push({
          player_id: p.player_id, step_number: n, description: `Cut wire ${n}`,
          completed: done, completed_at: done ? new Date(`2026-10-09T01:0${n}:00Z`) : null,
        });
      }
      await queryInterface.bulkInsert('defuse_steps', steps);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('game_sessions', { join_code: '482913' }, {});
  },
};