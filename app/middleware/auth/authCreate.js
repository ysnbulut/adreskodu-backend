require('dotenv').config();
const jwt = require('jsonwebtoken');

const userModel = require('../../models/userModel');

module.exports = async (req, res, next) => {
	try {
		const loginToken = req.cookies['AuthLoginToken'];
		if (typeof loginToken === 'undefined') {
			res.statusCode = 401;
			res.send({
				success: false,
				message: 'You must be logged in',
			});
		} else {
			if (
				typeof req.body.username !== 'undefined' &&
				req.body.username !== null &&
				req.body.username !== '' &&
				typeof req.body.password !== 'undefined' &&
				req.body.password !== null &&
				req.body.password !== ''
			) {
				try {
					const user = await userModel.findOne({ username: req.body.username, password: req.body.password });
					if (user !== null) {
						try {
							const decodedToken = jwt.verify(
								loginToken,
								'd87f0305a2d5f03edf76aa2796591b5224ce849e2025fcf869add1f9c49fe4d1',
								{ ignoreExpiration: true }
							);
							if (user.username === decodedToken.username && user.password === decodedToken.password) {
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
							} else {
								res.status(401).json({
									success: false,
									message: 'Unauthorized',
								});
							}
						} catch (error) {
							res.statusCode = 500;
							res.send({
								success: false,
								message: 'Internal server error',
							});
						}
					} else {
						res.status(401).json({
							success: false,
							message: 'User not found',
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
		}
	} catch (error) {
		return res.status(417).json({
			success: false,
			message: error,
		});
	}
};
