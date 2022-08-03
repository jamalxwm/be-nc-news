const { fetchArticleByID } = require('../models/articles');

exports.getArticlesByID = (req, res, next) => {
  fetchArticleByID(req.params.article_id)
    .then((article) => res.status(200).send(article))
    .catch((err) => next(err));
};
