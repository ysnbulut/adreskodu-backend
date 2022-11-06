require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const loginToken = req.cookies['AuthLoginToken'];
    if (typeof loginToken !== 'undefined') {
      try {
        const decodedToken = jwt.verify(loginToken, process.env.JWT_SECRET, { ignoreExpiration: true });
        if (decodedToken.exp * 1000 > Date.now()) {
          if (decodedToken.username === req.body.username) {
            if (req.body.password === decodedToken.password) {
              res.send({
                message: 'success',
                data: {
                  username: req.body.username,
                  message: "You're logged in",
                },
              });
            } else {
              res.clearCookie('AuthLoginToken');
              next();
            }
          } else {
            res.clearCookie('AuthLoginToken');
            next();
          }
        } else {
          res.clearCookie('AuthLoginToken');
          next();
        }
      } catch (error) {
        return res.status(417).json({
          message: error,
        });
      }
    } else {
      next();
    }
  } catch (error) {
    return res.status(417).json({
      message: error,
    });
  }
};
