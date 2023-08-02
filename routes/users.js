var express = require('express');
var router = express.Router();

const usersCtrl = require('../controllers/users');

// GET /users   => get	/		index
router.get('/', usersCtrl.index);

// PUT /users/:id/ =>  put	/:id		update
router.put('/:id', usersCtrl.update);

// DELETE /users/:id =>  Delete	/:id		destroy
router.delete('/:id', usersCtrl.destroy);

// show user and all its reviews
router.get('/:id', usersCtrl.show);

module.exports = router;
