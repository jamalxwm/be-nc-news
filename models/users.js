const db = require('../db/connection');

exports.fetchUsers = () => {
  return db.query(`SELECT * FROM users`).then((users) => {
    if (!users.rows.length) {
      return Promise.reject({ status: 404, msg: 'No users found' });
    }
    return users.rows;
  });
};
