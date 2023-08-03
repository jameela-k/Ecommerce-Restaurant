const Restaurant = require('../models/restaurant');
const Category = require('../models/category');
const cloudinary = require("../utils/cloudinary");
const path = require("path");

const { checkSchema, validationResult } = require('express-validator');

const restaurantFormCheckSchema = {
    name: {
        in: ['body'],
        notEmpty: true,
        errorMessage: 'Name is required',
        isLength: {
          options: { min: 2, max: 50 },
          errorMessage: 'name must be between 2 and 50 characters'
        }
    },
    description: {
      in: ['body'],
      isLength: {
        options: {
          min: 1,
          max: 255
      },
        errorMessage: 'description must be between 1 and 255 characters'
      }
    },
    file: {
        custom: {
          options: (value, { req }) => {
            // if (!req.file) {
            //   throw new Error('Image file is required');
            // }
            if(req.file) {
               
                if (!req.file.mimetype.startsWith('image/')) {
                  throw new Error('Invalid file type. Only image files are allowed');
                }

                let ext = path.extname(req.file.originalname);
                if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
                    throw new Error('Invalid image type');
                }
            }

            return true;
          }
        }
    },

    "address.shopNumber": {
        in: ['body'],
        isLength: {
          options: {
            min: 1,
            max: 255
        },
          errorMessage: 'Shop Number must be between 1 and 255 characters'
        }
    },
    "address.building": {
        in: ['body'],
        isLength: {
          options: {
            min: 1,
            max: 255
          },
          errorMessage: 'Building must be between 1 and 255 characters'
        }
    },
    "address.road": {
        in: ['body'],
        isLength: {
          options: {
            min: 1,
            max: 255
          },
          errorMessage: 'Road must be between 1 and 255 characters'
        }
    },
    "address.city": {
        in: ['body'],
        isLength: {
          options: {
            min: 1,
            max: 255
          },
          errorMessage: 'City must be between 1 and 255 characters'
        }
    },
    "address.block": {
        in: ['body'],
        isLength: {
          options: {
            min: 1,
            max: 255
          },
          errorMessage: 'Block must be between 1 and 255 characters'
        }
    },
    "address.country": {
        in: ['body'],
        isLength: {
          options: {
            min: 1,
            max: 255
          },
          errorMessage: 'Country must be between 1 and 255 characters'
        }
    },

} 

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
  
  let restaurants = [];
  // req.query.category = "Ali";
  if("category" in req.query && req.query.category){
    const allRestaurants = await Restaurant.find({}).populate('categories');
    for(let i=0; i < allRestaurants.length; i++){
      const restaurantCat = allRestaurants[i].categories;
      for(let j=0; j < restaurantCat.length; j++){
        // console.log(restaurantCat[j].name);
        if(restaurantCat[j].name == req.query.category){
          restaurants.push(allRestaurants[i]);
          break;
        }
      }
    }
  }else {
    restaurants = await Restaurant.find({}).populate('categories');
  }
  // console.log(restaurants);
  res.render('restaurants/index', { title: 'All Restaurants', restaurants });
}

async function newRestaurant(req, res) {
    const categories = await Category.find({});
    let errors = [];
    let formBody = [];
    if(req.session.errors) {
        // console.log(req.session.errors);
        formBody = req.session.formBody;
        delete req.session.formBody;
        errors = req.session.errors;
        delete req.session.errors;
    }
    res.render("restaurants/new", {title: 'New Restaurant', categories, errors, formBody});
}

async function create(req, res) {

  // validation
  try {
    // Manually run checkSchema to validate the request body
    await checkSchema(restaurantFormCheckSchema).run(req);

    // Check if there are any validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.session.formBody = req.body;
        req.session.errors = errors.mapped();
        // console.log(req.session.errors);
        return res.redirect(301, '/restaurants/new');
    }

  }catch (err) {
      // Handle errors thrown by checkSchema
      console.error(err);
      res.status(500).send('Internal server error');
  }
  // end validation

  // check if file exists Upload image to cloudinary
  if(req.file){
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    req.body.image = {};
    req.body.image.src = result.secure_url;
    req.body.image.cloudinary_id = result.public_id;
  }

  // Remove empty properties so that defaults will be applied
  for (let key in req.body) {
    if (req.body[key] === '') delete req.body[key];
  }

  try {
    const restaurant = await Restaurant.create(req.body);
    res.redirect(`/`);
  } catch (err) {
    console.log(err);
    res.redirect('restaurants/new');
  }
}

async function showOne(req, res) {
  const restaurant = await Restaurant.findById(req.params.id).populate('categories'); 

  res.render('restaurants/show', { title: 'Restaurant Detail', restaurant});

}

async function edit(req, res) {


    let errors = [];
    let formBody = [];
    if(req.session.errors) {
      // console.log(req.session.errors);
      formBody = req.session.formBody;
      delete req.session.formBody;
      errors = req.session.errors;
      delete req.session.errors;
    }
    const restaurant = await Restaurant.findById(req.params.id); 
    const RestaurantCategories = await Restaurant.findById(req.params.id).populate('categories');
    const categories = await Category.find({});
    // console.log("RestaurantCategories: ");
    // console.log(RestaurantCategories);
    res.render('restaurants/edit', { title: 'Restaurant Detail', restaurant, categories, RestaurantCategories:RestaurantCategories.categories, errors, formBody});
}


async function update(req, res) {

  // validation
  try {
    // Manually run checkSchema to validate the request body
    await checkSchema(restaurantFormCheckSchema).run(req);

    // Check if there are any validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.session.formBody = req.body;
        req.session.errors = errors.mapped();
        console.log(req.session.errors);
        return res.redirect(301, `/restaurants/${req.params.id}/edit`);
    }

  }catch (err) {
      // Handle errors thrown by checkSchema
      console.error(err);
      res.status(500).send('Internal server error');
  }
  // end validation

  const restaurant = await Restaurant.findById(req.params.id);
  console.log(restaurant);
    if(!("deleteImg" in req.body)){
      if(req.file){
        if("image" in restaurant){
          if("cloudinary_id" in restaurant.image){
            if(restaurant.image.cloudinary_id){
              // remove the image from the cloudinary
              await cloudinary.uploader.destroy(restaurant.image.cloudinary_id);
            }
          }
        }
        // Upload image to cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);
        req.body.image = {};
        req.body.image.src = result.secure_url;
        req.body.image.cloudinary_id = result.public_id;
      }
    }else {
      try{
        if("image" in restaurant){
          if("cloudinary_id" in restaurant.image){
            await cloudinary.uploader.destroy(restaurant.image.cloudinary_id);
            req.body.image = {};
          }
        }
        
      }catch(err){
        console.log(err);
      }
    }

    // Remove empty properties so that defaults will be applied
   
    for (let key in req.body) {
        if (req.body[key] === '') delete req.body[key];
    }

    if(!("categories" in req.body)){
      req.body.categories = [];
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
