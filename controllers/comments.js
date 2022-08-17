const { deleteCommentByID } = require('../models/comments');

exports.deleteComment = (req, res, next) => {
  const { comment_id: id } = req.params;

  deleteCommentByID(id)
    .then(() => res.status(204).send())
    .catch((err) => next(err));
};
