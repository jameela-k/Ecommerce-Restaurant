const Restaurant = require('../models/restaurant');
const Category = require('../models/category');

const { checkSchema, validationResult } = require('express-validator');


const categoryRouteParametersCheckSchema = {
  id: {
    in: ['params'],
    isMongoId: {
      errorMessage: 'Invalid ID'
    }
  },
}

const categoryFormCheckSchema = {

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
          // check if the category is exist
          let checkIfExist;
          if(req.params?.id){
            // for edit a category
            checkIfExist = await Category.findOne({name: value, _id: { $ne: req.params.id }});
          }else {
            // for create a new restaurant
            checkIfExist = await Category.findOne({name: value});
          }
          
          if(checkIfExist) {
            throw new Error(value + ' is already exist');
          }else {
            return true;
          }
        }
      }
  },
} 

module.exports = {
  index,
  create,
  update,
  destroy,
};

async function index(req, res) {
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
    const successMessages = req.flash('success');
    const errorMessages = req.flash('error');
    res.render('categories/index', { title: 'All Categories', categories, errors, formBody, successMessages, errorMessages });
  }catch(err){
    console.log(err);
  }
  
}


async function create(req, res) {

  // validation
  try {
    // Manually run checkSchema to validate the request body
    await checkSchema(categoryFormCheckSchema).run(req);

    // Check if there are any validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.session.formBody = req.body;
        req.session.errors = errors.mapped();
        req.flash('error', 'validation errors');
        return res.redirect(301, `/categories`);
    }

  }catch (err) {
      // Handle errors thrown by checkSchema
      console.error(err);
      // res.status(500).send('Internal server error');
  }
  // end validation
  
  // Remove empty properties so that defaults will be applied
  for (let key in req.body) {
    if (req.body[key] === '') delete req.body[key];
  }

  try {
    const category = await Category.create(req.body);
    console.log(category);
    if(category._id){
      req.flash('success', 'category is added successfully');
      return res.redirect(`/categories`);
    }else {
      // category is not added
      req.flash('error', 'an error occured while adding a new category');
      return res.redirect(301, '/categories');
    }
    
  } catch (err) {
    console.log(err);
    req.flash('error', 'an error occured');
    return res.redirect('/categories');
  }
}


async function update(req, res) {

   // validation
   try {

    // Manually run checkSchema to validate the route Parameters
    await checkSchema(categoryRouteParametersCheckSchema).run(req);

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
    await checkSchema(categoryFormCheckSchema).run(req);

    // Check if there are any validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        // check if one of the params IDs return an error
        const errors_mapped = errors.mapped();
        if(errors_mapped.id){
          req.flash('error', 'dont play with me please');
          return res.redirect(301, `/`);
        }
        req.session.formBody = req.body;
        req.session.errors = errors.mapped();
        req.flash('error', 'validation errors');
        return res.redirect(301, `/categories`);
    }

  }catch (err) {
      // Handle errors thrown by checkSchema
      console.error(err);
      // res.status(500).send('Internal server error');
  }
  // end validation
     
  for (let key in req.body) {
      if (req.body[key] === '') delete req.body[key];
  }

  try {
    const result = await Category.updateOne({_id: req.params.id}, req.body);
    // result: => in general
              // {
              //     acknowledged: true,
              //     modifiedCount: 1,
              //     upsertedId: null,
              //     upsertedCount: 0,
              //     matchedCount: 1
              // }
    if(result.acknowledged){
      if(result.matchedCount > 0){
        if(result.matchedCount == result.modifiedCount){
          // updated successfully
          req.flash('success', 'category updeted successfully');
          return res.redirect(301, `/categories`);
        }else{
          // not all of them are updated (but in our case it is only one category)
          req.flash('error', 'an error occured while updating the category');
          return res.redirect(301, `/categories`);
        }

      }else{
        // category to be update is not exist
        req.flash('error', 'the category to be updeted is no longer exist');
        return res.redirect(301, `/categories`);
      }
    }          
      
  } catch (err) {
      // Typically some sort of validation error
      console.log(err);
      res.redirect(`/categories`);
  }
}


async function destroy(req, res) {
  try {

     // Manually run checkSchema to validate the route Parameters
     await checkSchema(categoryRouteParametersCheckSchema).run(req);

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
     
    const result = await Category.deleteOne({_id: req.params.id}); 
    // result => // { acknowledged: true, deletedCount: 1 }
    if(result.acknowledged && result.deletedCount > 0){
      // deleted succ.
      req.flash('success', 'category was deleted successfully');
      return res.redirect(301, '/categories');

    }else{
      // error occured
      req.flash('error', 'an error occured, category was not deleted');
      return res.redirect(301, '/categories');
    }
      
  }catch(err) {
      console.log(err);
      return res.redirect(301, '/categories');
  }
}

