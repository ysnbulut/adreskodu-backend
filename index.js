require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();

mongoose
  .connect(
    `mongodb+srv://${process.env.ATLAS_USER}:${process.env.ATLAS_PASSWORD}@adreskodu.yhlaaz4.mongodb.net/adreskodudb?retryWrites=true&appname=adreskodudb&w=majority`,
    {
      useNewUrlParser: true,
    }
  )
  .then(() => {
    console.log('MongoDB connected!');
  })
  .catch((err) => {
    console.log(err);
  });

// App Setup
app.use(morgan('combined'));
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json({ type: '*/*' }));

//Middleware
const passwordHash = require('./app/middleware/user/passwordHash');
const authKey = require('./app/middleware/auth/authKey');
const apiAuth = require('./app/middleware/api/token');

//Routes
const userRouter = require('./app/routes/userRouter');
const keyRouter = require('./app/routes/keyRouter');
const tokenRouter = require('./app/routes/tokenRouter');
const apiRouter = require('./app/routes/apiRouter');

app.get('/', (req, res) => {
  res.send({
    message: 'Naber!',
  });
});
app.post('/', (req, res) => {
  res.send({
    message: 'Naber!',
  });
});
//user create login logout
app.use('/user', passwordHash, userRouter);
app.use('/key', authKey, keyRouter);
app.use('/auth', tokenRouter);
app.use('/api', apiAuth, apiRouter);
// Server Setup
const server = http.createServer(app);
server.listen(process.env.PORT || 4034, () => {
  console.log(`Server listening on port: 4034`);
});
