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
			const salt = '6e81acfd5c5f67e7fa80301b36e0cf838a732528c9abefda629fc095ded61fab';
			const cfg = {
				keySize: 4,
				hasher: cyrptoJS.algo.SHA512,
				iterations: 4444,
			};
			const hashPassword = cyrptoJS.PBKDF2(password, salt, cfg).toString();
			req.body.password = hashPassword;
			next();
		}
	}
};
