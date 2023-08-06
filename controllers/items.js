const Restaurant = require('../models/restaurant');
const cloudinary = require("../utils/cloudinary");
const mongoose = require('mongoose');
const path = require("path");

const { checkSchema, validationResult } = require('express-validator');

const itemRouteParametersCheckSchema = {
  id: {
    in: ['params'],
    optional: true,
    isMongoId: {
      errorMessage: 'Invalid ID'
    }
  },
  res_id: {
    in: ['params'],
    isMongoId: {
      errorMessage: 'Invalid ID'
    }
  },
}

const itemFormCheckSchema = {
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
          if(req.params?.res_id){
            const restaurant = await Restaurant.findById(req.params.res_id);
            if(restaurant.length < 1){
              // requested restuarant is not exist
                // save error in a flash message
                req.flash('error', 'requested restuarant is not exist');
                // return redirect
                return res.redirect(301, '/restaurants');
            }
            if(!req.params?.id){
              // create item
                checkIfExist = restaurant.menu.findIndex(item => item.name == value) + 1;  // + 1 because maybe its the first element(index = 0)
            }else {
              // update item
                const item = restaurant.menu.id(req.params.id);
                if(item) {
                  if(!item.name == value){
                    checkIfExist = restaurant.menu.findIndex(item =>
                      {
                       if(item.name == value && JSON.stringify(item._id) != JSON.stringify(req.params.id)){
                          return true;
                       }
                      }
                    ) + 1;   // + 1 because maybe its the first element(index = 0)
                  }else {
                    // it is the same item to be updated
                    return true;
                  }

                }else {
                  // requested item is not exist
                   // save error in a flash message
                  req.flash('error', 'requested item is no longer exist');
                  // return redirect
                  return res.redirect(301, `/restaurants/${req.params.res_id}`);
                }
            }
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
  type: {
      in: ['body'],
      optional: true,
      custom: {
        options: (value, { req }) => {
          if (value) {
            if(value.length < 1 || value.length >10){
              return false
            }
          }
          return true;
        },
        errorMessage: 'type must be between 1 and 10 characters'
      }
  },

  price: {
    in: ['body'],
    optional: {
      options: { checkFalsy: true }
    },
    isNumeric: {
      errorMessage: 'price must be a number'
    },
    custom: {
      options: (value, { req }) => {
        if (value) {
          if(value.length < 1 || value.length >10){
            return false
          }
        }
        return true;
      },
      errorMessage: 'type must be between 1 and 10 characters length'
    }
  },

} 

async function newItem(req, res) {
  try{

    // Manually run checkSchema to validate the route Parameters
    await checkSchema(itemRouteParametersCheckSchema).run(req);
  

    // Check if there are any validation errors
    const routeParametersErrors = validationResult(req);

    if (!routeParametersErrors.isEmpty()) {
        const errors_mapped = routeParametersErrors.mapped(); 
        // check if one of the params IDs return an error
        if(errors_mapped.res_id){
          req.flash('error', 'dont play with me please');
          return res.redirect(301, `/`);
        }
    }

    const restaurant = await Restaurant.findById(req.params.res_id); 
    if(restaurant){
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
      res.render("items/new", {title: 'ADD ITEM', restaurant, errors, formBody, errorMessages});
    }else{
      //requested restuarant is not exist
      // save error in a flash message
      req.flash('error', 'requested restuarant is not exist');
      // return redirect
      return res.redirect(301, '/restaurants');
    }
  }catch(err){
    console.log(err);
  }
}

async function create(req, res) {
  
  // validation
  try {

    // Manually run checkSchema to validate the route Parameters
    await checkSchema(itemRouteParametersCheckSchema).run(req);
  

    // Check if there are any validation errors
    const routeParametersErrors = validationResult(req);

    if (!routeParametersErrors.isEmpty()) {
        const errors_mapped = routeParametersErrors.mapped(); 
        // check if one of the params IDs return an error
        if(errors_mapped.res_id){
          req.flash('error', 'dont play with me please');
          return res.redirect(301, `/`);
        }
    }
    

    // Manually run checkSchema to validate the request body
    await checkSchema(itemFormCheckSchema).run(req);

    // Check if there are any validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.session.formBody = req.body;
        req.session.errors = errors.mapped();
        req.flash('error', 'validation errors');
        return res.redirect(301, `/restaurants/${req.params.res_id}/items/new`);
    }

  }catch (err) {
      // Handle errors thrown by checkSchema
      console.error(err);
      // res.status(500).send('Internal server error');
  }
  // end validation


   // Upload image to cloudinary
  if(req.file){ 
    try{
      const result = await cloudinary.uploader.upload(req.file.path);
      req.body.image = {};
      req.body.image.src = result.secure_url;
      req.body.image.cloudinary_id = result.public_id;
    }catch(err){
      console.log(err);
    }
  }else {
    // if user does not upload an image add the default image 
    req.body.image = {};
    req.body.image.src = "/images/dish.jpeg";
  }


  // Remove empty properties so that defaults will be applied
  for (let key in req.body) {
    if (req.body[key] === '') delete req.body[key];
  }

  if(req.body.price){
    try{
      // convert from string to Decimal128
      req.body.price = mongoose.Types.Decimal128.fromString(req.body.price);
    }catch(err){
      console.log(err);
    }
  }

  if(req.body.description){
    req.body.description = req.body.description.trim();
  }
  
  // add Item logic
  try {
    const restaurant = await Restaurant.findById(req.params.res_id);
    restaurant.menu.push(req.body);
    await restaurant.save();
    req.flash('success', 'Item is added successfully');
    res.redirect(`/restaurants/${restaurant._id}`);
  } catch (err) {
    console.log(err);
    // res.redirect('items/new');
  }
}

async function edit(req, res) {

   // Manually run checkSchema to validate the route Parameters
   await checkSchema(itemRouteParametersCheckSchema).run(req);
  

   // Check if there are any validation errors
   const routeParametersErrors = validationResult(req);

   if (!routeParametersErrors.isEmpty()) {
       const errors_mapped = routeParametersErrors.mapped(); 
       // check if one of the params IDs return an error
       if(errors_mapped.res_id || errors_mapped.id ){
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
  try{
    const restaurant = await Restaurant.findById(req.params.res_id); 
    if(restaurant){
      // const item = await Restaurant.findOne({"menu._id":req.params.id}, {"menu.$":1}); 
      const item = restaurant.menu.id(req.params.id);
      if(item){
        const errorMessages = req.flash('error');
        res.render('items/edit', { title: 'Edit ITEM', restaurant, item, errors, formBody, errorMessages});
      }else{
        // item is not exist
        // save error in a flash message
        req.flash('error', 'requested item is not exist');
        // return redirect
        return res.redirect(301, `/restaurants/${req.params.res_id}`);
      }
    }else {
      //requested restuarant is not exist
      // save error in a flash message
      req.flash('error', 'requested restuarant is not exist');
      // return redirect
      return res.redirect(301, '/restaurants');
    }
  }catch(err){
    console.log(err);
  }
  
}

async function update(req, res) {
  // validation
  try {


    // Manually run checkSchema to validate the route Parameters
    await checkSchema(itemRouteParametersCheckSchema).run(req);
  

    // Check if there are any validation errors
    const routeParametersErrors = validationResult(req);

    if (!routeParametersErrors.isEmpty()) {
        const errors_mapped = routeParametersErrors.mapped(); 
        // check if one of the params IDs return an error
        if(errors_mapped.res_id || errors_mapped.id){
          req.flash('error', 'dont play with me please');
          return res.redirect(301, `/`);
        }
    }

    // Manually run checkSchema to validate the request body
    await checkSchema(itemFormCheckSchema).run(req);

    // Check if there are any validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.session.formBody = req.body;
        req.session.errors = errors.mapped();
        req.flash('error', 'validation errors');
        return res.redirect(301, `/restaurants/${req.params.res_id}/items/${req.params.id}/edit`);
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
    const restaurant = await Restaurant.findById(req.params.res_id);
    if(restaurant){
      // the requested resturant is exist
      const item = restaurant.menu.id(req.params.id);
      if(item){
        if(!("deleteImg" in req.body)){
          if(req.file){
            if("image" in item){
              if("cloudinary_id" in item.image){
                if(item.image.cloudinary_id){
                  // remove the image from the cloudinary
                  try{
                    await cloudinary.uploader.destroy(item.image.cloudinary_id);
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
          if("image" in item){
            if("cloudinary_id" in item.image){
              try{
                // Destroy image from cloudinary
                await cloudinary.uploader.destroy(item.image.cloudinary_id);
              }catch(err){
                console.log(err);
              }
              req.body.image = {};
              // after remove the image set the default image
              req.body.image.src = "/images/dish.jpeg";
            }
          }
        }
      }else{
         // the requested item is not exist
        req.flash('error', 'the requested item is not exist');
        return res.redirect(301, `/restaurants/${req.params.res_id}`);
      }
    }else {
      // the requested resturant is not exist
      req.flash('error', 'the requested resturant is not exist');
      return res.redirect(301, `/restaurants`);
    }
  }catch(err){
    console.log(err);
  }
  // end image logic
  
  // Remove empty properties so that defaults will be applied
  for (let key in req.body) {
    if (req.body[key] === '') delete req.body[key];
  }

  if(req.body.price){
    try{
      // convert from string to Decimal128
      req.body.price = mongoose.Types.Decimal128.fromString(req.body.price);
    }catch(err){
      console.log(err);
    }
  }

  if(req.body.description){
    req.body.description = req.body.description.trim();
  }

  // Add item logic
  try {
      
      // const updatedRestaurant = await Restaurant.findOneAndUpdate({_id: req.params.res_id,"menu._id":req.params.id},
      // { 
      //     $set: 
      //     {
      //         "menu.$.name": req.body.name,
      //         "menu.$.image": req.body.image,
      //         "menu.$.type": req.body.type || null,
      //         "menu.$.description": req.body.description || null,
      //         "menu.$.price": req.body.price || null, 
      //     } 
      // },

      // { new: true });
      const restaurant = await Restaurant.findById(req.params.res_id);
      const item = restaurant.menu.id(req.params.id);
      if(item){
          item.name = req.body.name;
          if(req.body.image){
            item.image = req.body.image;
          } // no need for else because we already set the default image when the image is deleted
          if(req.body.type){
            item.type = req.body.type;
          }else{
            item.type = undefined;
          }
          if(req.body.description){
            item.description = req.body.description
          }else{
            item.description = undefined;
          }
          if(req.body.price){
            item.price = req.body.price;
          }else{
            item.price = undefined;
          }
      }else{
        // item to be updated is no longer exist
        req.flash('error', 'Item to be updated is no longer exist');
        return res.redirect(`/restaurants/${restaurant._id}`);
      }

      await restaurant.save();
      req.flash('success', 'Item is updated successfully');
      res.redirect(`/restaurants/${req.params.res_id}`);
  } catch (err) {
      console.log(err);
      //  res.redirect('items/new');
  }
}


async function destroy(req, res) {
    try {

        // Manually run checkSchema to validate the route Parameters
        await checkSchema(itemRouteParametersCheckSchema).run(req);
      

        // Check if there are any validation errors
        const routeParametersErrors = validationResult(req);

        if (!routeParametersErrors.isEmpty()) {
            const errors_mapped = routeParametersErrors.mapped(); 
            // check if one of the params IDs return an error
            if(errors_mapped.res_id || errors_mapped.id){
              req.flash('error', 'dont play with me please');
              return res.redirect(301, `/`);
            }
        }


        // const result = await Restaurant.findOneAndUpdate(
        //     {_id: req.params.res_id},
        //     {$pull: {menu: {_id:req.params.id}},
        // });

        const restaurant = await Restaurant.findById(req.params.res_id);
        const result = restaurant.menu.remove(req.params.id);
        console.log(result);
        if(result){
          await restaurant.save();
          req.flash('success', 'Item is deleted successfully');
        }else{
          // is not deleted successfully
          req.flash('error', 'an error ocurred');
        }
        res.redirect(`/restaurants/${req.params.res_id}`);
    }catch(err) {
        console.log(err);
        req.flash('error', 'an error ocurred');
        res.redirect(`/restaurants/${req.params.res_id}`);
    }
    
}


module.exports = {
    new: newItem,
    create,
    edit,
    update,
    destroy,
};