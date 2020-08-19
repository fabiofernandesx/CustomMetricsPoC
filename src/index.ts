import express from 'express';
const app = express();

const { createMiddleware } = require('@promster/express');

app.use(createMiddleware({ app }));

import { getSummary, getContentType } from '@promster/express';

const errorCounter = new app.locals.Prometheus.Counter({
  name: 'error_counter',
  help: 'implements a simple error counter as an example to be used in monitoring specific exceptions or conditions',
});
const accessCounter = new app.locals.Prometheus.Counter({
  name: 'access_counter',
  help: 'implements a simple access counter as an example to be used in monitoring specific requests or conditions',
});

app.use('/metrics', (req, res) => {
  req.statusCode = 200;

  res.setHeader('Content-Type', getContentType());
  res.end(getSummary());
});

app.get('/api', (req, res, next) => {
  accessCounter.inc();
  res.status(200).send('Simple api endpoint check.');
});
app.get('/api/fast', (req, res, next) => {
  res.status(200).send('Direct Response');
});
app.get('/api/slow', (req, res, next) => {
  errorCounter.inc();
  setTimeout(() => {
    // Simulating an error condition not throwing an error
    res.status(200).send('Delayed response (slow response)');
  }, 1000);
});
app.get('/api/error', (req, res, next) => {
  try {
    errorCounter.inc();
    throw new Error('Something broke...');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(4000, () => console.log('Server is running on port 4000'));
