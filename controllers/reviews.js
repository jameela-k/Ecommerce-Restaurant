const Restaurant = require('../models/restaurant');
const User = require('../models/user');

const { checkSchema, validationResult } = require('express-validator');


const reviewFormCheckSchema = {

  id: {
    in: ['params'],
    optional: true,
    isMongoId: {
      errorMessage: 'Invalid ID'
    }
  },
  res_id: {
    in: ['params'],
    optional: true,
    isMongoId: {
      errorMessage: 'Invalid ID'
    }
  },
  item_id: {
    in: ['params'],
    optional: true,
    isMongoId: {
      errorMessage: 'Invalid ID'
    }
  },

  user: {
    in: ['body'],
    notEmpty: true,
    errorMessage: 'user can not be empty',
    isMongoId: true,
    errorMessage: 'user is not valid mongoID',
  },

  userName: {
    in: ['body'],
    notEmpty: true,
    errorMessage: 'userName is required',
  },

  userAvatar: {
    in: ['body'],
    notEmpty: true,
    errorMessage: 'userAvatar is required',
  },

  comment: {
    in: ['body'],
    optional: true,
    custom: {
      options: (value, { req }) => {
        if (value) {
          if(value.length < 3 || value.length >255){
            return false
          }
        }
        return true;
      },
      errorMessage: 'comment must be between 3 and 255 characters'
    }
  },

  rating: {
    isNumeric: {
      errorMessage: 'rating must be a number'
    },
    custom: {
      options: (value, { req }) => {
        if (value) {
          if(value.length < 1 || value.length >5){
            return false
          }
        }
        return true;
      },
      errorMessage: 'rating must be between 1 and 5'
    }
  }
  
} 


async function create(req, res) {

  // validation
  try {
    // Manually run checkSchema to validate the request body
    await checkSchema(reviewFormCheckSchema).run(req);

    // Check if there are any validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        // check if one of the params IDs return an error
        const errors_mapped = errors.mapped();
        if(errors_mapped.id || errors_mapped.res_id || errors_mapped.item_id){
          req.flash('error', 'dont play with me please');
          return res.redirect(301, `/`);
        }
        req.session.formBody = req.body;
        req.session.errors = errors.mapped();
        req.flash('error', 'validation errors');
        return res.redirect(301, `/restaurants/${req.params.res_id}`);
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
     const restaurant = await Restaurant.findById(req.params.res_id);
     if(restaurant){
      const item = restaurant.menu.id(req.params.item_id);
      if(item){
        // validate if the user has a comment before or not because each user should has only one comment
        const checkIfExist = item.reviews.findIndex(item => JSON.stringify(item.user) == JSON.stringify(req.user)) + 1;
        if(!checkIfExist){
          item.reviews.push(req.body);
          await restaurant.save();
          req.flash('success', 'Comment is added successfully');
          return res.redirect(`/restaurants/${restaurant._id}`);
        }else{
          // this user has a comment before
          req.flash('error', 'you has a comment before');
          return res.redirect(`/restaurants/${restaurant._id}`);
        }
      }else {
        // requested item is no longer exist
        req.flash('error', 'requested item is no longer exist');
        return res.redirect(`/restaurants/${restaurant._id}`);
      }
     }else{
      // requested restaurant is not exist
      req.flash('error', 'requested restaurant is no longer exist');
      return res.redirect(`/restaurants`);
     }
  
   } catch (err) {
     console.log(err);
     // res.redirect('items/new');
   }
}


async function update(req, res) {


    // validation
    try {
      // Manually run checkSchema to validate the request body
      await checkSchema(reviewFormCheckSchema).run(req);

      // Check if there are any validation errors
      const errors = validationResult(req);

      if (!errors.isEmpty()) {

          // check if one of the params IDs return an error
          const errors_mapped = errors.mapped();
          if(errors_mapped.id || errors_mapped.res_id || errors_mapped.item_id){
            req.flash('error', 'dont play with me please');
            return res.redirect(301, `/`);
          }
          req.session.formBody = req.body;
          req.session.errors = errors.mapped();
          req.flash('error', 'validation errors');
          return res.redirect(301, `/restaurants/${req.params.res_id}`);
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
    const restaurant = await Restaurant.findById(req.params.res_id);
    if(restaurant){
      const item = restaurant.menu.id(req.params.item_id);
      if(item){
        const review = item.reviews.id(req.params.id);
        if(review){
          if(req.body.comment){
            review.comment = req.body.comment;
          }else {
            review.comment = undefined;
          }
          if(req.body.rating){
            review.rating = req.body.rating;
          }
          await restaurant.save();
          req.flash('success', 'Comment is updated successfully');
          return res.redirect(`/restaurants/${req.params.res_id}`);
        }else{
          // review is no longer exist
          req.flash('error', 'review to be update is no longer exist');
          return res.redirect(`/restaurants/${restaurant._id}`);
        }
        
      }else{
        // requested item is no longer exist
        req.flash('error', 'requested item is no longer exist');
        return res.redirect(`/restaurants/${restaurant._id}`);
      }
     
    }else{
      // requested restaurant is not exist
      req.flash('error', 'requested restaurant is no longer exist');
      return res.redirect(`/restaurants`);
    }
   
    } catch (err) {
        console.log(err);
        res.redirect(`/restaurants/${req.params.res_id}`);
    }
}


async function destroy(req, res) {
  try {
      const restaurant = await Restaurant.findById(req.params.res_id);
      if(restaurant){
        const item = restaurant.menu.id(req.params.item_id);
        if(item){
          const review = item.reviews.remove(req.params.id);
          if(review){
            await restaurant.save();
            req.flash('success', 'Comment is deleted successfully');
            res.redirect(`/restaurants/${req.params.res_id}`);
          }else{
            // review is no longer exist
            req.flash('error', 'review to be delete is no longer exist');
            return res.redirect(`/restaurants/${restaurant._id}`);
          }

        }else{
          // requested item is no longer exist
          req.flash('error', 'requested item is no longer exist');
          return res.redirect(`/restaurants/${restaurant._id}`);
        }
    
      }else{
        // requested restaurant is not exist
        req.flash('error', 'requested restaurant is no longer exist');
        return res.redirect(`/restaurants`);
      }
      
  } catch (err) {
      console.log(err);
      res.redirect(`/restaurants/${req.params.res_id}`);
  }
    
}


module.exports = {
    create,
    update,
    destroy,
};