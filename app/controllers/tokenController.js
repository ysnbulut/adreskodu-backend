require('dotenv').config();
const cyrptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const keyModel = require('../models/keyModel');
const userModel = require('../models/userModel');

const create = async (req, res, next) => {
	const { apiKey, secretKey } = req.body;
	const key = await keyModel.findOne({ secretKey });
	if (key) {
		const user = await userModel.findOne({ user_id: key.user_id });
		const cfg = {
			keySize: 4,
			hasher: cyrptoJS.algo.SHA512,
			iterations: 4444,
		};
		const generatedApiKey = cyrptoJS
			.PBKDF2(
				`${user._id}_${user.username}_${user.password}_${user.email}_${secretKey}`,
				'6e81acfd5c5f67e7fa80301b36e0cf838a732528c9abefda629fc095ded61fab',
				cfg
			)
			.toString();

		if (apiKey === generatedApiKey) {
			const uuid = uuidv4();
			const refresh_token = cyrptoJS.SHA512(uuid).toString();
			const aesApiKey = cyrptoJS.AES.encrypt(apiKey, secretKey).toString();
			const aesSecretKey = cyrptoJS.AES.encrypt(
				secretKey,
				'd87f0305a2d5f03edf76aa2796591b5224ce849e2025fcf869add1f9c49fe4d1'
			).toString();
			const token = jwt.sign(
				{ user_id: user._id, key: aesApiKey, secret_key: aesSecretKey, uuid: uuid },
				'd87f0305a2d5f03edf76aa2796591b5224ce849e2025fcf869add1f9c49fe4d1',
				{
					expiresIn: '15m',
				}
			);
			res.statusCode = 200;
			res.send({
				success: true,
				data: {
					token,
					refresh_token,
				},
			});
		} else {
			res.statusCode = 400;
			res.send({
				message: 'Invalid API key',
			});
		}
	} else {
		res.statusCode = 404;
		res.send({
			message: 'Key not found',
		});
	}
};

const refresh = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(' ')[1];
		const { user_id, key, secret_key, uuid } = jwt.verify(
			token,
			'd87f0305a2d5f03edf76aa2796591b5224ce849e2025fcf869add1f9c49fe4d1',
			{ ignoreExpiration: true }
		);
		const { refresh_token } = req.body;
		const sha512_uuid = cyrptoJS.SHA512(uuid).toString();
		if (refresh_token === sha512_uuid) {
			const new_uuid = uuidv4();
			const new_refresh_token = cyrptoJS.SHA512(new_uuid).toString();
			const new_token = jwt.sign(
				{ user_id, key, secret_key, uuid: new_uuid },
				'd87f0305a2d5f03edf76aa2796591b5224ce849e2025fcf869add1f9c49fe4d1',
				{
					expiresIn: '15m',
				}
			);
			res.statusCode = 200;
			res.send({
				success: true,
				data: {
					token: new_token,
					refresh_token: new_refresh_token,
				},
			});
		} else {
			res.statusCode = 400;
			res.send({
				success: false,
				message: 'Invalid refresh token',
			});
		}
	} catch (error) {
		res.statusCode = 401;
		res.send({
			success: false,
			message: error,
		});
	}
};

module.exports = {
	create,
	refresh,
};
