const express = require('express');
const app = express();
const { getTopics } = require('./controllers/topics');
const { getArticles, getArticlesByID, patchArticleByID } = require('./controllers/articles');
const errors = require('./errors');
const { getUsers } = require('./controllers/users');

app.use(express.json());

app.get('/api/topics', getTopics);

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id', getArticlesByID);
app.patch('/api/articles/:article_id', patchArticleByID);

app.get('/api/users', getUsers)

app.use(errors);

app.all('/*', (req, res) => {
  res.status(404).send({ msg: 'Not found' });
});

module.exports = app;
