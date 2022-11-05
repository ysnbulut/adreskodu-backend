module.exports = (req, res, next) => {
	if (
		typeof req.headers.authorization !== 'undefined' &&
		req.headers.authorization !== null &&
		req.headers.authorization !== '' &&
		typeof req.body.refresh_token !== 'undefined' &&
		req.body.refresh_token !== null &&
		req.body.refresh_token !== ''
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
