const db = require('../db/connection');

exports.fetchArticleByID = (id) => {
  return db
    .query(
      `SELECT 
      articles.*, COUNT(comments.comment_id)::int AS comment_count
    FROM articles
    FULL OUTER JOIN comments 
    ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id;`,
      [id]
    )
    .then((article) => {
      if (article.rows.length < 1) {
        return Promise.reject({ status: 404, msg: 'Article not found' });
      }
      return { article: article.rows };
    });
};

exports.fetchArticles = () => {
  return db
    .query(
      `SELECT 
      articles.*, COUNT(comments.comment_id)::int AS comment_count
    FROM articles
    FULL OUTER JOIN comments 
    ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY created_at DESC;`)
    .then((article) => {
      if (article.rows.length < 1) {
        return Promise.reject({ status: 404, msg: 'No articles found' });
      }
      return article.rows ;
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
