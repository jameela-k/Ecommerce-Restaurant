var express = require('express');
var router = express.Router();

const usersCtrl = require('../controllers/users');

// Require the auth middleware
const ensureLoggedIn = require('../config/ensureLoggedIn');
const ensureIsAdmin = require('../config/ensureIsAdmin');

// GET /users   => get	/		index
router.get('/', usersCtrl.index);

// PUT /users/:id/ =>  put	/:id		update
router.put('/:id', ensureLoggedIn, ensureIsAdmin, usersCtrl.update);

// DELETE /users/:id =>  Delete	/:id		destroy
router.delete('/:id', ensureLoggedIn, ensureIsAdmin, usersCtrl.destroy);

// show user and all its reviews
router.get('/:id', usersCtrl.show);

module.exports = router;
