const morgan = require('morgan');

// Custom morgan token for request body
morgan.token('body', (req) => {
  return JSON.stringify(req.body);
});

// Custom morgan token for response time in a more readable format
morgan.token('response-time-ms', (req, res) => {
  return `${res.get('X-Response-Time')}ms`;
});

// Custom format for development
const devFormat = ':method :url :status :response-time-ms - :res[content-length] - :body';

// Custom format for production (less verbose)
const prodFormat = ':method :url :status :response-time-ms - :res[content-length]';

// Configure morgan based on environment
const configureMorgan = (app) => {
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan(devFormat));
  } else {
    app.use(morgan(prodFormat));
  }
};

module.exports = configureMorgan;
