require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const loginToken = req.cookies['AuthLoginToken'];
    if (typeof loginToken === 'undefined') {
      res.statusCode = 401;
      res.send({
        success: false,
        message: 'You must be logged in',
      });
    } else {
      try {
        //burada expire dolmuşsa çalışmayacak
        const decodedToken = jwt.verify(loginToken, process.env.JWT_SECRET, { ignoreExpiration: true });
        if (decodedToken.exp * 1000 > Date.now()) {
          req.body.decodeToken = decodedToken;
          next();
        } else {
          res.clearCookie('AuthLoginToken');
          res.statusCode = 401;
          res.send({
            success: false,
            message: 'Login expired',
          });
        }
      } catch (error) {
        return res.status(417).json({
          success: false,
          message: error,
        });
      }
    }
  } catch (error) {
    return res.status(417).json({
      success: false,
      message: error,
    });
  }
};
