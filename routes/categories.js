var express = require('express');
var router = express.Router();
const categoriesCtrl = require('../controllers/categories');

// GET /categories   => get	/		index
router.get('/', categoriesCtrl.index);

// PUT /categories/:id/ =>  put	/:id		update
router.put('/:id', categoriesCtrl.update);

// POST /categories/ =>  Post	/		create
router.post('/', categoriesCtrl.create);

// DELETE /categories/:id =>  Delete	/:id		destroy
router.delete('/:id', categoriesCtrl.destroy);


module.exports = router;
