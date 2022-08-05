const comments = require('../db/data/test-data/comments');
const {
  fetchArticleByID,
  updateVotesOnArticleByID,
  fetchArticles,
  fetchArticleComments,
  insertComment,
} = require('../models/articles');

exports.getArticles = (req, res, next) => {
  const { sort_by, order, topic } = req.query;
  fetchArticles(sort_by, order, topic)
    .then((articles) => res.status(200).send({ articles }))
    .catch((err) => next(err));
};

exports.getArticlesByID = (req, res, next) => {
  fetchArticleByID(req.params.article_id)
    .then((article) => res.status(200).send({ article }))
    .catch((err) => next(err));
};

exports.patchArticleByID = (req, res, next) => {
  const { article_id: id } = req.params;
  const { inc_votes: vote } = req.body;
  updateVotesOnArticleByID(id, vote)
    .then((article) => res.status(200).send({ article }))
    .catch((err) => next(err));
};

exports.getArticleComments = (req, res, next) => {
  const { article_id: id } = req.params;
  fetchArticleComments(id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => next(err));
};

exports.postComment = (req, res, next) => {
  const { article_id: id } = req.params;
  const { username, body } = req.body;
  insertComment(id, username, body)
    .then((comment) => res.status(201).send({ comment }))
    .catch((err) => next(err));
};
