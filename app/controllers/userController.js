require('dotenv').config();
const jwt = require('jsonwebtoken');

const userModel = require('../models/userModel');
//herokuda env dosyası açılamadığı için böyle oldu
const userRegister = 'close';
const create = async (req, res, next) => {
	if (userRegister === 'open') {
		try {
			const { name, email, username, password } = req.body;
			const find = await userModel.findOne({ email, username });
			if (!find) {
				const user = await userModel.create({
					name,
					email,
					username,
					password,
				});
				res.statusCode = 200;
				res.send({
					message: 'success',
					data: {
						id: user._id,
						name: user.name,
						email: user.email,
						username: user.username,
						password: user.password,
					},
				});
			} else {
				res.statusCode = 400;
				res.send({
					message: 'User already exists',
				});
			}
		} catch (error) {
			next(error);
		}
	} else {
		res.statusCode = 404;
		res.send({
			message: 'User registration is disabled',
		});
	}
};

const login = async (req, res, next) => {
	const { username, password } = req.body;
	const user = await userModel.findOne({ username });
	if (!user) {
		res.statusCode = 404;
		res.send({
			message: 'Username not found',
		});
	} else {
		if (password === user.password) {
			res.statusCode = 200;
			const loginToken = jwt.sign(
				{
					user_id: user._id,
					username: username,
					password: password,
					email: user.email,
					is_active: user.is_active,
					created: Date.now(),
				},
				'd87f0305a2d5f03edf76aa2796591b5224ce849e2025fcf869add1f9c49fe4d1',
				{
					expiresIn: '24h',
				}
			);
			res.cookie('AuthLoginToken', loginToken, {
				maxAge: 60 * 60 * 12 * 1000,
				expires: new Date(Date.now() + 60 * 60 * 12 * 1000),
				httpOnly: true,
				path: '/',
			});
			res.send({
				message: 'success',
				data: {
					username: user.username,
					message: "You're logged in",
				},
			});
		} else {
			res.statusCode = 404;
			res.send({
				message: 'Password is incorrect',
			});
		}
	}
};

const logout = async (req, res, next) => {
	res.clearCookie('AuthLoginToken');
	res.send({
		message: 'success',
		data: {
			message: "You're logged out",
		},
	});
};

module.exports = {
	createController: create,
	loginController: login,
	logoutController: logout,
};
