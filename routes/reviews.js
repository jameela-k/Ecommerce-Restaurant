var express = require('express');
var router = express.Router();

const reviewsCtrl = require('../controllers/reviews');

// Require the auth middleware
const ensureLoggedIn = require('../config/ensureLoggedIn');

// POST /restaurants/:res_id/items/:item_id/reviews/ =>  Post	/		create
router.post('/:res_id/items/:item_id/reviews/', ensureLoggedIn, reviewsCtrl.create);

// PUT  /restaurants/:res_id/items/:item_id/reviews/:id =>  put	/:id		update
router.put('/:res_id/items/:item_id/reviews/:id', ensureLoggedIn, reviewsCtrl.update);

// DELETE /restaurants/:res_id/items/:item_id/reviews/:id =>  Delete	/:id		destroy
router.delete('/:res_id/items/:item_id/reviews/:id', ensureLoggedIn, reviewsCtrl.destroy);


module.exports = router;
