const express = require('express');
const keyRouter = express.Router();

const { create, get } = require('../controllers/keyController');

const passwordHash = require('../middleware/user/passwordHash');
const authKeyCreate = require('../middleware/auth/authCreate');

keyRouter.all('/', (req, res) => {
  res.send({
    message: 'Key Router',
  });
});

keyRouter.post('/create', [(passwordHash, authKeyCreate)], create);
keyRouter.post('/get', get);

module.exports = keyRouter;
