const db = require('../db/connection');
const { selectTopics } = require('./topics');

exports.fetchArticles = async (
  sort_by = 'created_at',
  order = 'DESC',
  topic
) => {
  if (!['ASC', 'DESC'].includes(order.toUpperCase()))
    return Promise.reject({ status: 400, msg: 'Invalid order query' });

  const validSort = await validateSortUtil(sort_by);
  if (validSort.status === 400) return Promise.reject(validSort);

  const validFilter = await validateFilterUtil(topic);
  if (validFilter.status === 400) return Promise.reject(validFilter);

  let query = `SELECT articles.*, COUNT(comments.comment_id)::int AS comment_count FROM articles FULL OUTER JOIN comments ON articles.article_id = comments.article_id`;

  if (!topic) {
    query += ` GROUP BY articles.article_id ORDER BY ${sort_by} ${order};`;
  } else {
    query += ` WHERE articles.topic = '${topic}' GROUP BY articles.article_id ORDER BY ${sort_by} ${order}`;
  }

  const { rows } = await db.query(query);
  if (!rows.length) {
    return Promise.reject({ status: 404, msg: 'No articles found' });
  }

  return rows;
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
    `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`,
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

////////// Utility functions

// Validates required user inputs
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

validateSortUtil = async (sort_by) => {
  const { rows } = await db.query(`SELECT column_name
  FROM information_schema.columns
 WHERE table_schema = 'public'
   AND table_name   = 'articles'
     ;`);

  if (rows.some((column) => column.column_name === `${sort_by}`)) {
    return { status: 200 };
  } else {
    return Promise.reject({ status: 400, msg: 'Invalid sort query' });
  }
};

validateFilterUtil = async (topic) => {
  if (!topic) return { status: 200 };

  const rows = await selectTopics();

  if (rows.some((e) => e.slug === `${topic}`)) {
    return { status: 200 };
  } else {
    return Promise.reject({ status: 400, msg: 'Invalid filter query' });
  }
};
