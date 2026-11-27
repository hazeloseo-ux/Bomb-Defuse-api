// Builds the Express app. Does NOT start listening - server.js does that.
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const env = require('./config/env');
const routes = require('./routes');
const notFound = require('./middlewares/not-found');
const errorHandler = require('./middlewares/error-handler');

const app = express();

// Render sits in front of the API, so trust its first proxy header (the real client address).
app.set('trust proxy', 1);

// Middleware runs in this order for every request.
if (env.nodeEnv !== 'test') app.use(morgan('dev'));   // 1. one log line per request
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })); // 2. safe headers
// 3. Browsers may read our answers only from the origins in CORS_ORIGINS.
//    curl and Postman send no Origin header and are not affected by CORS.
app.use(cors({ origin: (origin, done) => done(null, !origin || env.corsOrigins.includes(origin)) }));
app.use(express.json());                              // 4. turn the JSON body into req.body
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'))); // pictures are public files
// Hub Contract: every endpoint lives under /api/v1
app.use('/api/v1', routes);                           // 5. the routes

app.use(notFound);                                    // 6. no route matched
app.use(errorHandler);                                // 7. something was thrown

module.exports = app;