const db = require('../db/connection');

exports.fetchArticles = () => {
  return db
    .query(
      `SELECT 
      articles.*, COUNT(comments.comment_id)::int AS comment_count
    FROM articles
    FULL OUTER JOIN comments 
    ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY created_at DESC;`
    )
    .then((article) => {
      if (article.rows.length < 1) {
        return Promise.reject({ status: 404, msg: 'No articles found' });
      }
      return article.rows;
    });
};

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
      return article.rows;
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

exports.fetchArticleComments = async (id) => {
  const article = await this.fetchArticleByID(id);
  if (article.status === 404) return Promise.reject(article);

  const { rows } = await db.query(
    `SELECT * FROM comments WHERE article_id = $1;`,
    [id]
  );
  return rows;
};

exports.insertComment = async (id, username, body) => {
  const article = await this.fetchArticleByID(id);
  if (article.status === 404) return Promise.reject(article);

  const userInput = await validateUserInputUtil(username, body);
  if (userInput.status === 400) return Promise.reject(userInput);

  const { rows } = await db.query(
    `INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *;`,
    [id, username, body]
  );
  return rows[0];
};

validateUserInputUtil = (username, body) => {
  const input = {
    user: username,
    body: body,
  };

  switch (true) {
    case !input.user && !input.body:
      return Promise.reject({
        status: 400,
        msg: 'Username and body are required',
      });
      break;
    case typeof input.user === 'number' && !input.body:
      return Promise.reject({
        status: 400,
        msg: 'Username must be a string, body is required',
      });
      break;
    case typeof input.user === 'number':
      return Promise.reject({ status: 400, msg: 'Username must be a string' });
      break;
    case !input.user:
      return Promise.reject({ status: 400, msg: 'Username is required' });
      break;
    case !input.body:
      return Promise.reject({ status: 400, msg: 'Body is required' });
      break;
    default:
      return { status: 200 };
  }
};
