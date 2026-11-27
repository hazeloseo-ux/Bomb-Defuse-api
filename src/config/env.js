// Loads .env once and fails fast when a required key is missing.
require('dotenv').config({ quiet: true });

// On Render the database comes as ONE address (DATABASE_URL). On your computer it comes as five keys.
const hasUrl = Boolean(process.env.DATABASE_URL);

const REQUIRED = [
  'HUB_API_KEY', 'JWT_SECRET', 'CORS_ORIGINS',
  ...(hasUrl ? [] : ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']),
];
const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Missing required .env keys: ${missing.join(', ')}. ` +
      'Copy .env.example to .env and fill in your own values.'
  );
}

// postgres://user:password@host:5432/name  ->  the same fields the five keys give.
function dbFromUrl(address) {
  const url = new URL(address);
  return {
    host: url.hostname,
    port: Number(url.port) || 5432,
    name: decodeURIComponent(url.pathname.slice(1)),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
  };
}

const db = hasUrl
  ? dbFromUrl(process.env.DATABASE_URL)
  : {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      name: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3001,
  hubApiKey: process.env.HUB_API_KEY,
  bcryptRounds: 10,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  corsOrigins: process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
  db: { ...db, ssl: process.env.DB_SSL === 'true' },
};