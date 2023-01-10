const express = require('express');
const cors = require('cors');
const app = express();
const serverless = require("serverless-http")
const { getTopics } = require('../controllers/topics');
const { getUsers, getUser } = require('../controllers/users');
const {
  getArticles,
  getArticlesByID,
  patchArticleByID,
  getArticleComments,
  postComment,
} = require('../controllers/articles');
const endpoints = require('../endpoints.json');


const errors = require('../errors');
const { deleteComment } = require('../controllers/comments');

app.use(cors());
app.use(express.json());

app.get('/api/topics', getTopics);

app.get('/api/articles', getArticles);

app.get('/api/articles/:article_id', getArticlesByID);
app.patch('/api/articles/:article_id', patchArticleByID);

app.get('/api/articles/:article_id/comments', getArticleComments);
app.post('/api/articles/:article_id/comments', postComment);

app.delete('/api/comments/:comment_id', deleteComment);

app.get('/api/users', getUsers);
app.get('/api/users/:username', getUser)

app.get('/api', (req, res) => res.send(endpoints));

app.use(errors);

app.all('/*', (req, res) => {
  res.status(404).send({ msg: 'Not found' });
});

app.use(`/.netlify/functions/api`, )
module.exports = app;
