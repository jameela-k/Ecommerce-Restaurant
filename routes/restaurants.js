var express = require('express');
var router = express.Router();
const upload = require("../utils/multer");
const restaurantsCtrl = require('../controllers/restaurants');

// Require the auth middleware
const ensureLoggedIn = require('../config/ensureLoggedIn');
const ensureIsAdmin = require('../config/ensureIsAdmin');


// GET /restaurants   => get	/		index
router.get('/', restaurantsCtrl.index);

// GET /restaurants/new =>  Get	/new		new
router.get('/new', ensureLoggedIn, ensureIsAdmin, restaurantsCtrl.new);

// GET /restaurants/:id =>  get 	/:id		show one
router.get('/:id', restaurantsCtrl.show);

// GET /restaurants/:id/edit =>  get 	/:id/edit		edit
router.get('/:id/edit', ensureLoggedIn, ensureIsAdmin, restaurantsCtrl.edit);

// PUT /restaurants/:id/ =>  put	/:id		update
router.put('/:id', ensureLoggedIn, ensureIsAdmin, upload.single('file'),  restaurantsCtrl.update);

// POST /restaurants/ =>  Post	/		create
router.post('/', ensureLoggedIn, ensureIsAdmin, upload.single('file'), restaurantsCtrl.create);

// DELETE /restaurants/:id =>  Delete	/:id		destroy
router.delete('/:id', ensureLoggedIn, ensureIsAdmin, restaurantsCtrl.destroy);


module.exports = router;
