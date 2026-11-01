// A database rule was broken -> what the client should hear.
module.exports = {
  uq_player_nickname: {
    status: 409,
    code: 'NICKNAME_TAKEN',
    message: 'That nickname is already used in this game.',
  },
  uq_one_seat: {
    status: 409,
    code: 'ALREADY_SEATED',
    message: 'This account already has a seat in this game.',
  },
  game_sessions_join_code_key: {
    status: 409,
    code: 'CODE_UNAVAILABLE',
    message: 'That join code is already used. Please try again.',
  },
  game_sessions_question_set_id_fkey: {
    status: 409,
    code: 'QUESTION_SET_IN_USE',
    message: 'This question set was used in a game and cannot be deleted.',
  },
};