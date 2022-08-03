const db = require('../db/connection');

exports.fetchArticleByID = (id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1;`, [id])
    .then((article) => {
      if (article.rows.length < 1) {
        return Promise.reject({ status: 404, msg: 'Article not found' });
      }
      return { article: article.rows };
    });
};