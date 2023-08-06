const Restaurant = require('../models/restaurant');
const Category = require('../models/category');
const cloudinary = require("../utils/cloudinary");
const path = require("path");

const { checkSchema, validationResult } = require('express-validator');


const restaurantRouteParametersCheckSchema = {
  id: {
      in: ['params'],
      isMongoId: {
          errorMessage: 'Invalid ID'
      }
  },
}

const restaurantFormCheckSchema = {
    name: {
        in: ['body'],
        notEmpty: true,
        errorMessage: 'Name is required',
        isLength: {
          options: { min: 2, max: 50 },
          errorMessage: 'name must be between 2 and 50 characters'
        },
        custom: {
          options: async(value, { req }) => {
            // check if the restaurant is exist
            let checkIfExist;
            if(req.params?.id){
              // for edit a restaurant
              checkIfExist = await Restaurant.findOne({name: value, _id: { $ne: req.params.id }});
            }else {
              // for create a new restaurant
              checkIfExist = await Restaurant.findOne({name: value});
            }
            
            if(checkIfExist) {
              throw new Error(value + ' is already exist');
            }else {
              return true;
            }
          }
        }
    },
    description: {
      in: ['body'],
        optional: true,
        custom: {
          options: (value, { req }) => {
            value = value.trim();
            if (value) {
              if(value.length < 10 || value.length >255){
                return false
              }
            }
            return true;
          },
          errorMessage: 'description must be between 10 and 255 characters'
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
        optional: true,
        custom: {
          options: (value, { req }) => {
            if (value) {
              if(value.length < 1 || value.length > 50){
                return false
              }
            }
            return true;
          },
          errorMessage: 'Shop Number must be between 1 and 50 characters'
        }
    },
    "address.building": {
        in: ['body'],
        optional: true,
        custom: {
          options: (value, { req }) => {
            if (value) {
              if(value.length < 1 || value.length > 50){
                return false
              }
            }
            return true;
          },
          errorMessage: 'Building must be between 1 and 50 characters'
        }
        
    },
    "address.road": {
        in: ['body'],
        optional: true,
        custom: {
          options: (value, { req }) => {
            if (value) {
              if(value.length < 1 || value.length > 50){
                return false
              }
            }
            return true;
          },
          errorMessage: 'Road must be between 1 and 50 characters'
        }
        
    },
    "address.city": {
        in: ['body'],
        optional: true,
        custom: {
          options: (value, { req }) => {
            if (value) {
              if(value.length < 1 || value.length > 50){
                return false
              }
            }
            return true;
          },
          errorMessage: 'City must be between 1 and 50 characters'
        }
    },
    "address.block": {
        in: ['body'],
        optional: true,
        custom: {
          options: (value, { req }) => {
            if (value) {
              if(value.length < 1 || value.length > 50){
                return false
              }
            }
            return true;
          },
          errorMessage: 'Block must be between 1 and 50 characters'
        }
    },
    "address.country": {
        in: ['body'],
        optional: true,
        custom: {
          options: (value, { req }) => {
            if (value) {
              if(value.length < 1 || value.length > 50){
                return false
              }
            }
            return true;
          },
          errorMessage: 'Country must be between 1 and 50 characters'
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
  
  try {
    let restaurants = [];
    if("category" in req.query && req.query.category){
      // find restaurants by category
      const allRestaurants = await Restaurant.find({}).populate('categories');
      for(let i=0; i < allRestaurants.length; i++){
        const restaurantCat = allRestaurants[i].categories;
        for(let j=0; j < restaurantCat.length; j++){
          if(restaurantCat[j].name == req.query.category){
            restaurants.push(allRestaurants[i]);
            break;  // to stop the inner loop
          }
        }
      }
    }else {
      // all restaurants
      restaurants = await Restaurant.find({}).populate('categories');
    }
    const successMessages = req.flash('success');
    const errorMessages = req.flash('error');
    res.render('restaurants/index', { title: 'All Restaurants', restaurants, successMessages, errorMessages});
    
  }catch(err){
    console.log(err);
  }

}

async function newRestaurant(req, res) {
    try{
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
      const errorMessages = req.flash('error');
      res.render("restaurants/new", {title: 'New Restaurant', categories, errors, formBody, errorMessages});
    }catch(err){
      console.log(err);
    }
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
        req.flash('error', 'validation errors');
        return res.redirect(301, '/restaurants/new');
    }

  }catch (err) {
      // Handle errors thrown by checkSchema
      console.error(err);
      // res.status(500).send('Internal server error');
  }
  // end validation

  // check if file exists Upload image to cloudinary
  if(req.file){
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    req.body.image = {};
    req.body.image.src = result.secure_url;
    req.body.image.cloudinary_id = result.public_id;
  }else {
    // if user does not upload an image add the default image 
    req.body.image = {};
    req.body.image.src = "/images/restaurant.jpg";
  }

  // Remove empty properties so that defaults will be applied
  for (let key in req.body) {
    if (req.body[key] === '') delete req.body[key];
  }

  if(req.body.description){
    req.body.description = req.body.description.trim();
  }

  // add restaurant logic
  try {
    const restaurant = await Restaurant.create(req.body);
    if(restaurant) {
      req.flash('success', 'restaurant is added successfully');
      res.redirect(`/restaurants`);
    }else {
      req.flash('error', 'an error occured');
      return res.redirect(301, '/restaurants/new');
    }
  } catch (err) {
    console.log(err);
    req.flash('error', 'an error occured');
    res.redirect('restaurants/new');
  }
}

async function showOne(req, res) {
  try{
    // Manually run checkSchema to validate the route Parameters
    await checkSchema(restaurantRouteParametersCheckSchema).run(req);
  

    // Check if there are any validation errors
    const routeParametersErrors = validationResult(req);

    if (!routeParametersErrors.isEmpty()) {
        const errors_mapped = routeParametersErrors.mapped(); 
        // check if one of the params IDs return an error
        if(errors_mapped.id){
          req.flash('error', 'dont play with me please');
          return res.redirect(301, `/`);
        }
    }
    const restaurant = await Restaurant.findById(req.params.id).populate('categories'); 
    if(restaurant){

      // sort items by type
      restaurant.menu.sort((a, b) => {
        if (a.type < b.type) return -1;
        if (a.type > b.type) return 1;
        return 0;
      });
      

      let errors = [];
      let formBody = [];
      if(req.session.errors) {
        formBody = req.session.formBody;
        delete req.session.formBody;
        errors = req.session.errors;
        delete req.session.errors;
      }
      const successMessages = req.flash('success');
      const errorMessages = req.flash('error');
      res.render('restaurants/show', { title: 'Restaurant Detail', restaurant, errors, formBody, successMessages, errorMessages});
    }else {
      // requested restaurant is not exist
      res.redirect(301, '/restaurants');
    }
   
  }catch(err){
    console.log(err);
  }
}

async function edit(req, res) {
  try{
    // Manually run checkSchema to validate the route Parameters
    await checkSchema(restaurantRouteParametersCheckSchema).run(req);
  

    // Check if there are any validation errors
    const routeParametersErrors = validationResult(req);

    if (!routeParametersErrors.isEmpty()) {
        const errors_mapped = routeParametersErrors.mapped(); 
        // check if one of the params IDs return an error
        if(errors_mapped.id){
          req.flash('error', 'dont play with me please');
          return res.redirect(301, `/`);
        }
    }
    let errors = [];
    let formBody = [];
    if(req.session.errors) {
      formBody = req.session.formBody;
      delete req.session.formBody;
      errors = req.session.errors;
      delete req.session.errors;
    }
    // find the requested restaurant
    const restaurant = await Restaurant.findById(req.params.id); 
    // populate the categories of the requested restaurant
    const RestaurantCategories = await Restaurant.findById(req.params.id).populate('categories');
    // find all categories (to compare them with the RestaurantCategories)
    const categories = await Category.find({});

    const errorMessages = req.flash('error');
    res.render('restaurants/edit', { title: 'Restaurant Detail', restaurant, categories, RestaurantCategories:RestaurantCategories.categories, errors, formBody, errorMessages});
  }catch(err){
    console.log(err);
  }
}


async function update(req, res) {

  // validation
  try {


    // Manually run checkSchema to validate the route Parameters
    await checkSchema(restaurantRouteParametersCheckSchema).run(req);
  

    // Check if there are any validation errors
    const routeParametersErrors = validationResult(req);

    if (!routeParametersErrors.isEmpty()) {
        const errors_mapped = routeParametersErrors.mapped(); 
        // check if one of the params IDs return an error
        if(errors_mapped.id){
          req.flash('error', 'dont play with me please');
          return res.redirect(301, `/`);
        }
    }


    // Manually run checkSchema to validate the request body
    await checkSchema(restaurantFormCheckSchema).run(req);

    // Check if there are any validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.session.formBody = req.body;
        req.session.errors = errors.mapped();
        console.log(req.session.errors);
        req.flash('error', 'validation errors');
        return res.redirect(301, `/restaurants/${req.params.id}/edit`);
    }

  }catch (err) {
    // Handle errors thrown by checkSchema
    console.error(err);
      // res.status(500).send('Internal server error');
  }
  // end validation


  // image logic
  try{
    // retrieve the requested resturant
    const restaurant = await Restaurant.findById(req.params.id);
    if(restaurant){
      // the requested resturant is exist
      if(!("deleteImg" in req.body)){
        if(req.file){
          if("image" in restaurant){
            if("cloudinary_id" in restaurant.image){
              if(restaurant.image.cloudinary_id){
                // remove the image from the cloudinary
                try{
                  await cloudinary.uploader.destroy(restaurant.image.cloudinary_id);
                }catch(err){
                  console.log(err);
                }
              }
            }
          }
          // Upload image to cloudinary
          try{
            const result = await cloudinary.uploader.upload(req.file.path);
            req.body.image = {};
            req.body.image.src = result.secure_url;
            req.body.image.cloudinary_id = result.public_id;
          }catch(err){
            console.log(err);
          }
        }
      }else {
        if("image" in restaurant){
          if("cloudinary_id" in restaurant.image){
            try{
              await cloudinary.uploader.destroy(restaurant.image.cloudinary_id);
            }catch(err){
              console.log(err);
            }
            req.body.image = {};
            // after remove the image set the default image
            req.body.image.src = "/images/restaurant.jpg";
          }
        }
      }
    }else {
      // the requested resturant is not exist
      res.redirect(301, `/restaurants`);
    }
  }catch(err){
    console.log(err);
  }
  // end image logic


  // Remove empty properties so that defaults will be applied
  
  for (let key in req.body) {
      if (req.body[key] === '') delete req.body[key];
  }

  if(!("categories" in req.body)){
    req.body.categories = [];
  }

  if(req.body.description){
    req.body.description = req.body.description.trim();
  }

  // update restaurant logic
  try {
      // Update this line because now we need the _id of the new movie
      const result = await Restaurant.updateOne({_id: req.params.id}, req.body);
      if(result.acknowledged){
        if(result.matchedCount > 0){
          if(result.matchedCount == result.modifiedCount){
            // updated successfully
            req.flash('success', 'resturant updeted successfully');
            res.redirect(`/restaurants/${req.params.id}`);
          }else{
            // not all of them are updated (but in our case it is only one restaurant)
            req.flash('error', 'an error occured');
            res.redirect(`/restaurants/${req.params.id}`);
          }

        }else{
          // restaurant to be update is not exist
          req.flash('error', 'the restaurnt to be updeted is no longer exist');
          res.redirect(`/restaurants`);
        }
      }
      // console.log(result);
      // result:
          // {
          //     acknowledged: true,
          //     modifiedCount: 1,
          //     upsertedId: null,
          //     upsertedCount: 0,
          //     matchedCount: 1
          // }
      
  } catch (err) {
      // Typically some sort of validation error
      console.log(err);
      req.flash('error', 'an error ocurred');
      res.redirect(`/restaurants/${req.params.id}/edit`);
  }
}


async function destroy(req, res) {
  try {

      // Manually run checkSchema to validate the route Parameters
      await checkSchema(restaurantRouteParametersCheckSchema).run(req);
    

      // Check if there are any validation errors
      const routeParametersErrors = validationResult(req);

      if (!routeParametersErrors.isEmpty()) {
          const errors_mapped = routeParametersErrors.mapped(); 
          // check if one of the params IDs return an error
          if(errors_mapped.id){
            req.flash('error', 'dont play with me please');
            return res.redirect(301, `/`);
          }
      }
      const result = await Restaurant.deleteOne({_id: req.params.id}); 
      // console.log(result);
        // { acknowledged: true, deletedCount: 1 }
      if(result.acknowledged && result.deletedCount > 0){
        // deleted succ.
        req.flash('success', 'resturant was deleted successfully');
        res.redirect(301, '/restaurants');

      }else{
        // error occured
        req.flash('error', 'an error occured restuarnt was not deleted');
        res.redirect(301, '/restaurants');
      }
      
  }catch(err) {
      console.log(err);
      req.flash('error', 'an error occured');
      res.redirect('/restaurants');
  }
}
