var express = require('express');
var router = express.Router();

const usersCtrl = require('../controllers/users');

// GET /users   => get	/		index
router.get('/', usersCtrl.index);

// GET /users/:id/edit =>  get 	/:id/edit		edit
router.get('/:id/edit', usersCtrl.edit);

// PUT /users/:id/ =>  put	/:id		update
router.put('/:id', usersCtrl.update);

// DELETE /users/:id =>  Delete	/:id		destroy
router.delete('/:id', usersCtrl.destroy);

module.exports = router;
