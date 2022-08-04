const {
  fetchArticleByID,
  updateVotesOnArticleByID,
  fetchArticles,
} = require('../models/articles');

exports.getArticlesByID = (req, res, next) => {
  fetchArticleByID(req.params.article_id)
    .then((article) => res.status(200).send(article))
    .catch((err) => next(err));
};

exports.getArticles = (req, res, next) => {
  fetchArticles()
    .then((articles) => res.status(200).send(articles))
    .catch((err) => next(err));
};
exports.patchArticleByID = (req, res, next) => {
  const { article_id: id } = req.params;
  const { inc_votes: vote } = req.body;
  updateVotesOnArticleByID(id, vote)
    .then((article) => res.status(200).send(article))
    .catch((err) => next(err));
};
