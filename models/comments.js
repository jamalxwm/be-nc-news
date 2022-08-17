const db = require('../db/connection');

exports.deleteCommentByID = async (id) => {

  if (isNaN(parseInt(id))) {
    return Promise.reject({ status: 400, msg: 'Invalid comment ID' });
  }

  const { rows } = await db.query(
    `DELETE FROM comments WHERE comment_id = $1 RETURNING *;`,
    [id]
  );

  if (!rows.length)
    return Promise.reject({ status: 404, msg: 'No comments found' });
};
