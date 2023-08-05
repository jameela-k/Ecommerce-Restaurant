var express = require('express');
var router = express.Router();
const categoriesCtrl = require('../controllers/categories');

// Require the auth middleware
const ensureLoggedIn = require('../config/ensureLoggedIn');
const ensureIsAdmin = require('../config/ensureIsAdmin');

// GET /categories   => get	/		index
router.get('/', categoriesCtrl.index);

// PUT /categories/:id/ =>  put	/:id		update
router.put('/:id', ensureLoggedIn, ensureIsAdmin, categoriesCtrl.update);

// POST /categories/ =>  Post	/		create
router.post('/', ensureLoggedIn, ensureIsAdmin, categoriesCtrl.create);

// DELETE /categories/:id =>  Delete	/:id		destroy
router.delete('/:id', ensureLoggedIn, ensureIsAdmin, categoriesCtrl.destroy);


module.exports = router;
