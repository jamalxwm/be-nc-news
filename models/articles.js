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

exports.updateVotesOnArticleByID = (id, vote) => {
  if (vote !== undefined) {
    return db
      .query(
        `UPDATE articles SET votes = votes + $2 WHERE article_id = $1 RETURNING *;`,
        [id, vote]
      )
      .then((article) => {
        if (article.rows.length < 1) {
          return Promise.reject({ status: 404, msg: 'Article not found' });
        }
        return article.rows;
      });
  }
  return Promise.reject({
    status: 400,
    msg: 'No votes submitted',
  });
};
