const Restaurant = require('../models/restaurant');
const cloudinary = require("../utils/cloudinary");

module.exports = {
  index,
  show: showOne,
  new: newRestaurant,
  create,
  edit,
  update,
  destroy,
};

async function index(req, res) {
  const restaurants = await Restaurant.find({});
  res.render('restaurants/index', { title: 'All Restaurants', restaurants });
}

async function newRestaurant(req, res) {
    res.render("restaurants/new", {title: 'New Restaurant'});
}

async function create(req, res) {
  
   // Upload image to cloudinary
  const result = await cloudinary.uploader.upload(req.file.path);

  // Remove empty properties so that defaults will be applied
  for (let key in req.body) {
    if (req.body[key] === '') delete req.body[key];
  }
  req.body.image = {};
  req.body.image.src = result.secure_url;
  req.body.image.cloudinary_id = result.public_id;
  try {

    const restaurant = await Restaurant.create(req.body);
    res.redirect(`/`);
  } catch (err) {
    console.log(err);
    res.redirect('restaurants/new');
  }
}

async function showOne(req, res) {
  const restaurant = await Restaurant.findById(req.params.id); 
  res.render('restaurants/show', { title: 'Restaurant Detail', restaurant});

}

async function edit(req, res) {
    const restaurant = await Restaurant.findById(req.params.id); 
    res.render('restaurants/edit', { title: 'Restaurant Detail', restaurant});
}


async function update(req, res) {
  
    if(req.file){
        // Upload image to cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);
        console.log(result);
        req.body.image = {};
        req.body.image.src = result.secure_url;
        req.body.image.cloudinary_id = result.public_id;
    }

    // Remove empty properties so that defaults will be applied
   
    for (let key in req.body) {
        if (req.body[key] === '') delete req.body[key];
    }

    try {
        // Update this line because now we need the _id of the new movie
        const result = await Restaurant.updateOne({_id: req.params.id}, req.body);
        console.log(result);
        // result:
            // {
            //     acknowledged: true,
            //     modifiedCount: 1,
            //     upsertedId: null,
            //     upsertedCount: 0,
            //     matchedCount: 1
            // }
        res.redirect(`/restaurants/${req.params.id}`);
    } catch (err) {
        // Typically some sort of validation error
        console.log(err);
        res.redirect(`/restaurants/${req.params.id}/edit`);
    }
  }


async function destroy(req, res) {
    try {
        const result = await Restaurant.deleteOne({_id: req.params.id}); 
        console.log(result);
        res.redirect('/restaurants');
    }catch(err) {
        console.log(err);
        res.redirect('/restaurants');
    }
    
}

