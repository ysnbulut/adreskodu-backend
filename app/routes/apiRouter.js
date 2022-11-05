const express = require('express');
const apiRouter = express.Router();

const hashid = require('../middleware/api/hashid');

const {
	provinces,
	districts,
	neighborhoods,
	streets,
	buildings,
	doors,
	address,
} = require('../controllers/apiController');

apiRouter.get('/provinces', hashid, provinces);
apiRouter.get('/districts/:province_id', hashid, districts);
apiRouter.get('/neighborhoods/:district_id', hashid, neighborhoods);
apiRouter.get('/streets/:neighborhood_id', hashid, streets);
apiRouter.get('/buildings/:neighborhood_id/:street_id', hashid, buildings);
apiRouter.get('/doors/:neighborhood_id/:building_id', hashid, doors);
apiRouter.get('/address/:registration_number/:addres_code', hashid, address);

module.exports = apiRouter;
