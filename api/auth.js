const jwt = require('jsonwebtoken');

module.exports = params => {
  return function (req, res, next) {
    const bearerToken = req.get('token');
    if (bearerToken) {
      jwt.verify(bearerToken, process.env.JWT_KEY, function (err, decoded) {
        // Forbidden
        if (err) {
          res.sendStatus(403)
        } else {
          res.locals.user = decoded.user;
          next();
        }
      });
    }
  }
}