require('dotenv').config();
const Hashids = require('hashids');
const hashids = new Hashids(process.env.HASHID_SALT, parseInt(process.env.HASHID_LENGTH));

module.exports = (req, res, next) => {
  if (typeof req.params !== 'undefined' && typeof req.params === 'object') {
    for (const key in req.params) {
      if (req.params.hasOwnProperty(key)) {
        const element = req.params[key];
        if (typeof element === 'string' && element.length === 12) {
          const decoded = hashids.decode(element);
          if (decoded.length > 0) {
            let dec_param_value = decoded[0];
            dec_param_value = dec_param_value.toString().slice(0, -3);
            dec_param_value = parseInt(dec_param_value);
            req.params[key] = dec_param_value;
          }
        }
      }
    }
    next();
  } else {
    next();
  }
};
