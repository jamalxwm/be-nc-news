module.exports = (err, _req, res, _next) => {
  switch (err.code) {
    case "42P01":
      res.status(500).send({ msg: "Internal Error" });
      break;
    case "22P02":
      res.status(400).send({ msg: "Bad request" });
      break;
    case "23502":
      res.status(400).send({ msg: "Bad Query" });
      break;
    default:
      res.status(err.status).send({ msg: err.msg });
  }
};