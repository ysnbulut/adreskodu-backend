require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	try {
		const loginToken = req.cookies['AuthLoginToken'];
		if (typeof loginToken === 'undefined') {
			res.statusCode = 401;
			res.send({
				success: false,
				message: 'You must be logged in',
			});
		} else {
			try {
				//burada expire dolmuşsa çalışmayacak
				const decodedToken = jwt.verify(
					loginToken,
					'd87f0305a2d5f03edf76aa2796591b5224ce849e2025fcf869add1f9c49fe4d1',
					{ ignoreExpiration: true }
				);
				if (decodedToken.exp * 1000 > Date.now()) {
					req.body.decodeToken = decodedToken;
					next();
				} else {
					res.clearCookie('AuthLoginToken');
					res.statusCode = 401;
					res.send({
						success: false,
						message: 'Login expired',
					});
				}
			} catch (error) {
				return res.status(417).json({
					success: false,
					message: error,
				});
			}
		}
	} catch (error) {
		return res.status(417).json({
			success: false,
			message: error,
		});
	}
};
