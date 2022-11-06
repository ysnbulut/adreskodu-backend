const express = require('express');
const userRouter = express.Router();

const userLogin = require('../middleware/user/userLogin');

const { createController, loginController, logoutController } = require('../controllers/userController');

userRouter.all('/', (req, res) => {
  res.send({
    message: 'User Router',
  });
});
userRouter.post('/create', createController);
userRouter.post('/login', userLogin, loginController);
userRouter.post('/logout', logoutController);

module.exports = userRouter;
