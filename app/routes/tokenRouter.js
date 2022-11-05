const express = require('express');
const tokenRouter = express.Router();

const tokenCreate = require('../middleware/token/tokenCreate');
const tokenRefresh = require('../middleware/token/tokenRefresh');
const { create, refresh } = require('../controllers/tokenController');

tokenRouter.post('/create', tokenCreate, create);
tokenRouter.post('/refresh', tokenRefresh, refresh);

module.exports = tokenRouter;
