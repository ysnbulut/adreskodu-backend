require('dotenv').config();
const cyrptoJS = require('crypto-js');

module.exports = (req, res, next) => {
  if (req.path === '/logout') {
    next();
  } else {
    const { username, password } = req.body;
    if (typeof username === 'undefined' || typeof password === 'undefined') {
      res.statusCode = 406;
      res.send({
        message: 'Invalid request',
      });
    } else {
      const cfg = {
        keySize: parseInt(process.env.PBKDF2_KEY_SIZE),
        hasher: cyrptoJS.algo.SHA512,
        iterations: parseInt(process.env.PBKDF2_ITERATIONS),
      };
      const hashPassword = cyrptoJS.PBKDF2(password, process.env.GLOBAL_SALT, cfg).toString();
      req.body.password = hashPassword;
      next();
    }
  }
};
