const { fetchUsers, fetchUser } = require('../models/users');

exports.getUsers = (req, res) => {
  fetchUsers()
    .then((users) => res.status(200).send({ users }))
    .catch((err) => next(err));
};

exports.getUser = (req, res, next) => {
  fetchUser(req.params.username)
    .then((user) => res.status(200).send({ user }))
    .catch((err) => next(err));
};
