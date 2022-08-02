const express = require('express');
const app = express();
const { getTopics } = require('./controllers/nc-news.js');

app.use(express.json());

app.get('/api/topics', getTopics);

app.all('/*', (req, res) => {
  res.status(400).send({ msg: 'Bad request' });
});
module.exports = app;
