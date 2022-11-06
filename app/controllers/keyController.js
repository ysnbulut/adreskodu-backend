require('dotenv').config();
const cyrptoJS = require('crypto-js');
const { v4: uuidv4 } = require('uuid');

const keyModel = require('../models/keyModel');

const get = async (req, res, next) => {
  const { user_id, username, password, email, is_active } = req.body.decodeToken;
  if (is_active) {
    const cfg = {
      keySize: parseInt(process.env.PBKDF2_KEY_SIZE),
      hasher: cyrptoJS.algo.SHA512,
      iterations: parseInt(process.env.PBKDF2_ITERATIONS),
    };
    const find = await keyModel.findOne({ user_id: user_id });
    if (find) {
      const apiKey = cyrptoJS
        .PBKDF2(`${user_id}_${username}_${password}_${email}_${find.secretKey}`, process.env.GLOBAL_SALT, cfg)
        .toString();
      res.statusCode = 200;
      res.send({
        success: true,
        data: {
          apiKey: apiKey,
          secretKey: find.secretKey,
        },
      });
    } else {
      res.statusCode = 400;
      res.send({
        success: false,
        message: 'ApiKey does not exist',
      });
    }
  } else {
    res.statusCode = 401;
    res.send({
      success: false,
      message: 'Account is not active',
    });
  }
};

const create = async (req, res, next) => {
  const { user_id, username, password, email, is_active } = req.body.decodeToken;
  if (is_active) {
    const cfg = {
      keySize: parseInt(process.env.PBKDF2_KEY_SIZE),
      hasher: cyrptoJS.algo.SHA512,
      iterations: parseInt(process.env.PBKDF2_ITERATIONS),
    };
    const find = await keyModel.findOne({ user_id });
    if (find === null) {
      try {
        const secretKey = cyrptoJS.SHA256(uuidv4()).toString();
        const apiKey = cyrptoJS
          .PBKDF2(`${user_id}_${username}_${password}_${email}_${secretKey}`, process.env.GLOBAL_SALT, cfg)
          .toString();

        const key = await keyModel.create({
          user_id,
          secretKey,
        });
        res.send({
          success: true,
          data: {
            apiKey,
            secretKey,
          },
        });
      } catch (error) {
        res.statusCode = 417;
        res.send({
          success: false,
          message: error,
        });
      }
    } else {
      const apiKey = cyrptoJS
        .PBKDF2(`${user_id}_${username}_${password}_${email}_${find.secretKey}`, salt, cfg)
        .toString();
      res.statusCode = 400;
      res.send({
        success: true,
        message: 'Key already exists',
        data: {
          apiKey: apiKey,
          secretKey: find.secretKey,
        },
      });
    }
  } else {
    res.statusCode = 401;
    res.send({
      success: false,
      message: 'Account is not active',
    });
  }
};

module.exports = {
  get,
  create,
};
