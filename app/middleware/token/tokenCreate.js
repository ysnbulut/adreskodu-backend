module.exports = (req, res, next) => {
  if (
    typeof req.body.apiKey !== 'undefined' &&
    req.body.apiKey !== null &&
    req.body.apiKey !== '' &&
    typeof req.body.secretKey !== 'undefined' &&
    req.body.secretKey !== null &&
    req.body.secretKey !== ''
  ) {
    next();
  } else {
    res.statusCode = 406;
    res.send({
      success: false,
      message: 'Invalid request',
    });
  }
};
