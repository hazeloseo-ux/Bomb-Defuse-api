// Reads the name of the database constraint that an insert, update or delete broke.
// Returns null when the error is not a constraint violation.
const { UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');

// PostgreSQL reports ON DELETE RESTRICT as 23001. Sequelize leaves it as a plain
// database error, so we recognise it ourselves.
const RESTRICT_VIOLATION = '23001';

function constraintOf(error) {
  if (error instanceof UniqueConstraintError || error instanceof ForeignKeyConstraintError) {
    return (error.parent && error.parent.constraint) || error.index || 'unknown';
  }
  if (error && error.parent && error.parent.code === RESTRICT_VIOLATION) {
    const match = /constraint "([^"]+)"/.exec(error.parent.message || '');
    return error.parent.constraint || (match && match[1]) || 'unknown';
  }
  return null;
}

module.exports = { constraintOf };