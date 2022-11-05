const nviClass = require('../classes/nviClass');

//Nvi classdan gelen errorlar üzerinde çalışma yapıp burda ona göre cevap vermelisin
const provinces = async (req, res, next) => {
	const result = await nviClass.getProvinces();
	if (result.success) {
		res.status(200).send(result);
	} else {
		res.status(400).send(result);
	}
};

const districts = async (req, res, next) => {
	const result = await nviClass.getDistricts(req.params.province_id);
	if (result.success) {
		res.status(200).send(result);
	} else {
		res.status(400).send(result);
	}
};

const neighborhoods = async (req, res, next) => {
	const result = await nviClass.getNeighborhoods(req.params.district_id);
	if (result.success) {
		res.status(200).send(result);
	} else {
		res.status(400).send(result);
	}
};

const streets = async (req, res, next) => {
	const result = await nviClass.getStreets(req.params.neighborhood_id);
	if (result.success) {
		res.status(200).send(result);
	} else {
		res.status(400).send(result);
	}
};

const buildings = async (req, res, next) => {
	const result = await nviClass.getBuildings(req.params.neighborhood_id, req.params.street_id);
	if (result.success) {
		res.status(200).send(result);
	} else {
		res.status(400).send(result);
	}
};

const doors = async (req, res, next) => {
	const result = await nviClass.getDoorNumbers(req.params.neighborhood_id, req.params.building_id);
	if (result.success) {
		res.status(200).send(result);
	} else {
		res.status(400).send(result);
	}
};

const address = async (req, res, next) => {
	const result = await nviClass.getFullAddress(req.params.registration_number, req.params.addres_code);
	if (result.success) {
		res.status(200).send(result);
	} else {
		res.status(400).send(result);
	}
};

module.exports = {
	provinces,
	districts,
	neighborhoods,
	streets,
	buildings,
	doors,
	address,
};
