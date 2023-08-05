var express = require('express');
var router = express.Router();
const upload = require("../utils/multer");
const itemsCtrl = require('../controllers/items');

// Require the auth middleware
const ensureLoggedIn = require('../config/ensureLoggedIn');
const ensureIsAdmin = require('../config/ensureIsAdmin');

// no need for it because we already will print them inside the =>   // GET /restaurants/:id
    // GET /restaurants/:res_id/items/  => get	/		index
    // router.get('/restaurants/:res_id/items/', itemsCtrl.index);

// GET /restaurants/:res_id/items/new =>  Get	/new		new
router.get('/restaurants/:res_id/items/new', ensureLoggedIn, ensureIsAdmin, itemsCtrl.new);

// no need for it because we already will print them inside the =>   // GET /restaurants/:id
    // GET /restaurants/:res_id/items/:id =>  get 	/:id		show one 
    // router.get('/restaurants/:res_id/items/:id', itemsCtrl.show);

// GET /restaurants/:res_id/items/:id/edit =>  get 	/:id/edit		edit
router.get('/restaurants/:res_id/items/:id/edit', ensureLoggedIn, ensureIsAdmin, itemsCtrl.edit);

// PUT /restaurants/:res_id/items/:id =>  put	/:id		update
router.put('/restaurants/:res_id/items/:id', ensureLoggedIn, ensureIsAdmin, upload.single('file'), itemsCtrl.update);

// POST /restaurants/:res_id/items/ =>  Post	/		create
router.post('/restaurants/:res_id/items/', ensureLoggedIn, ensureIsAdmin, upload.single('file'), itemsCtrl.create);

// DELETE /restaurants/:res_id/items/:id =>  Delete	/:id		destroy
router.delete('/restaurants/:res_id/items/:id', ensureLoggedIn, ensureIsAdmin, itemsCtrl.destroy);


module.exports = router;
