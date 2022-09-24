const db = require('../db/connection');

exports.fetchUsers = () => {
  return db.query(`SELECT * FROM users`).then((users) => {
    if (!users.rows.length) {
      return Promise.reject({ status: 404, msg: 'No users found' });
    }
    return users.rows;
  });
};

exports.fetchUser = (username) => {
  return db
    .query(`SELECT * FROM users WHERE username = $1`, [username])
    .then((user) => {
      if (!user.rows.length) {
        return Promise.reject({ status: 404, msg: 'No user found' });
      }
      return user.rows[0];
    });
};
