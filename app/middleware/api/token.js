require('dotenv').config();
const cyrptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

const userModel = require('../../models/userModel');

module.exports = async (req, res, next) => {
  if (
    typeof req.headers.authorization !== 'undefined' &&
    req.headers.authorization !== null &&
    req.headers.authorization !== ''
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const { user_id, key, secret_key, uuid, ...timestamps } = jwt.verify(token, process.env.JWT_SECRET, {
        ignoreExpiration: true,
      });
      const secretKey = cyrptoJS.AES.decrypt(secret_key, process.env.JWT_SECRET).toString(cyrptoJS.enc.Utf8);
      const apiKey = cyrptoJS.AES.decrypt(key, secretKey).toString(cyrptoJS.enc.Utf8);
      const user = await userModel.findOne({ _id: user_id });
      const cfg = {
        keySize: parseInt(process.env.PBKDF2_KEY_SIZE),
        hasher: cyrptoJS.algo.SHA512,
        iterations: parseInt(process.env.PBKDF2_ITERATIONS),
      };
      const generatedApiKey = cyrptoJS
        .PBKDF2(
          `${user._id}_${user.username}_${user.password}_${user.email}_${secretKey}`,
          process.env.GLOBAL_SALT,
          cfg
        )
        .toString();
      if (timestamps.exp * 1000 > Date.now()) {
        if (apiKey === generatedApiKey) {
          req.body.user_id = user_id;
          req.body.apiKey = apiKey;
          req.body.secretKey = secretKey;
          next();
        } else {
          res.status(401).json({
            success: false,
            message: 'Unauthorized',
          });
        }
      } else {
        res.statusCode = 401;
        res.send({
          success: false,
          message: 'Token expired',
        });
      }
    } catch (error) {
      return res.status(417).json({
        success: false,
        message: error,
      });
    }
  } else {
    res.statusCode = 406;
    res.send({
      success: false,
      message: 'Invalid request',
    });
  }
};
