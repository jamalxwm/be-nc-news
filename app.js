const express = require('express');
const app = express();
const { getTopics } = require('./controllers/topics');
const { getArticlesByID } = require('./controllers/articles');
const { handlePsqlErrors, handleCustomErrors } = require('./errors');

app.use(express.json());

app.get('/api/topics', getTopics);

app.get('/api/articles/:article_id', getArticlesByID);

app.use(handleCustomErrors);
app.use(handlePsqlErrors);

app.all('/*', (req, res) => {
  res.status(404).send({ msg: 'Not found' });
});

module.exports = app;
