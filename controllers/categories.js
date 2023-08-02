const Restaurant = require('../models/restaurant');
const Category = require('../models/category');


module.exports = {
  index,
  create,
  update,
  destroy,
};

async function index(req, res) {
  const categories = await Category.find({});
  res.render('categories/index', { title: 'All Categories', categories });
}



async function create(req, res) {
  
  // Remove empty properties so that defaults will be applied
  for (let key in req.body) {
    if (req.body[key] === '') delete req.body[key];
  }

  try {
    const category = await Category.create(req.body);
    res.redirect(`/categories`);
  } catch (err) {
    console.log(err);
    res.redirect('/categories');
  }
}


async function update(req, res) {
     
    for (let key in req.body) {
        if (req.body[key] === '') delete req.body[key];
    }

    try {
        
        const result = await Category.updateOne({_id: req.params.id}, req.body);
        res.redirect(`/categories`);
    } catch (err) {
        // Typically some sort of validation error
        console.log(err);
        res.redirect(`/categories`);
    }
}


async function destroy(req, res) {
    try {
        const result = await Category.deleteOne({_id: req.params.id}); 
        console.log(result);
        res.redirect('/categories');
    }catch(err) {
        console.log(err);
        res.redirect('/categories');
    }
    
}

