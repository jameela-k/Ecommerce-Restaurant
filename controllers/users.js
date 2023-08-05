const User = require('../models/user');
const Restaurant = require('../models/restaurant');

const { checkSchema, validationResult } = require('express-validator');

const userRouteParametersCheckSchema = {
    id: {
        in: ['params'],
        isMongoId: {
            errorMessage: 'Invalid ID'
        }
    },
}

const userFormCheckSchema = {
    
    userType: {
        notEmpty: {
          errorMessage: 'userType is required'
        },
        isIn: {
          options: [['admin', 'user']],
          errorMessage: 'Invalid userType value'
        }
    }
} 

module.exports = {
    index,
    update,
    destroy,
    show: showOne,
};

async function showOne(req, res) {
  
    try {

        await checkSchema(userRouteParametersCheckSchema).run(req);
  
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

        //get all restaurants
        const restaurants = await Restaurant.find({});
        const dbUser = await User.findOne ({_id: req.params.id})
        // console.log("selected user");
        // console.log(dbUser);

        if(dbUser){
            const successMessages = req.flash('success');
            const errorMessages = req.flash('error');
            return res.render(`users/show`, { title: "All User's Reviews", dbUser, restaurants, successMessages, errorMessages});
        }else{
            req.flash('error', 'user is no longer exist');
            return res.redirect(301, '/users')
        }
    } 
    catch (err) {
        console.log(err);
        req.flash('error', 'an error ocurred');
        return res.redirect(`/users`);
    }
}

// show index (all users) function
async function index(req, res) {
    try{
        // get all users from database and store them in constant users
        const dbUsers = await User.find({});
        const successMessages = req.flash('success');
        const errorMessages = req.flash('error');
        let errors = [];
        let formBody = [];
        if(req.session.errors) {
            // console.log(req.session.errors);
            // I think I dont need the formBody
            formBody = req.session.formBody;
            delete req.session.formBody;
            errors = req.session.errors;
            delete req.session.errors;
        }

        //render users/index page and pass title "all users" and users constant
        return res.render('users/index', { title: 'All Users', dbUsers, formBody, errors, errorMessages, successMessages });
    }catch(err){
        console.log(err);
    }
}

// update user function
async function update(req, res) {

    // validation
    try {

        // Manually run checkSchema to validate the route Parameters
        await checkSchema(userRouteParametersCheckSchema).run(req);
  
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
        await checkSchema(userFormCheckSchema).run(req);

        // Check if there are any validation errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.session.formBody = req.body;
            req.session.errors = errors.mapped();
            req.flash('error', 'validation errors');
            return res.redirect(301, `/users`);
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
        // update restaurant in database using req.params.id as _id
        const result = await User.updateOne({_id: req.params.id}, req.body);
        if(result.acknowledged){
            if(result.matchedCount > 0){
              if(result.matchedCount == result.modifiedCount){
                // updated successfully
                req.flash('success', 'user updeted successfully');
                // redirect to users show page
                return res.redirect(`/users/${req.params.id}`);
              }else{
                // not all of them are updated (but in our case it is only one user)
                req.flash('error', 'user is not updeted successfully');
                // redirect to users index page
                return res.redirect(`/users/${req.params.id}`);
              }
    
            }else{
              // user to be update is not exist
              req.flash('error', 'the user to be updeted is no longer exist');
              // redirect to users index page
              return res.redirect(`/users`);
            }
        }
    } catch (err) {
        // if failed return to the edit page
        console.log(err);
        req.flash('error', 'an error ocurred');
         // redirect to users show page
         return res.redirect(`/users/${req.params.id}`);
        // res.redirect(`/users/${req.params.id}/edit`);  ?? is there any route like this?
    }
}

// Delete user from database function
async function destroy(req, res) {

    try {

         // Manually run checkSchema to validate the route Parameters
         await checkSchema(userRouteParametersCheckSchema).run(req);

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
         // end validation

        // delete the user using req.params.id as _id
        const result = await User.deleteOne({_id: req.params.id}); 
            // console.log(result);
            // { acknowledged: true, deletedCount: 1 }
        if(result.acknowledged && result.deletedCount > 0){
            // deleted succ.
            req.flash('success', 'user was deleted successfully');
            // redirect to users index
            return res.redirect(301, '/users');

        }else{
            // error occured
            req.flash('error', 'an error occured, user was not deleted');
            // redirect to users index
            return res.redirect(301, '/users');
        }
        
        
    // if failed
    }catch(err) {
        console.log(err);
        req.flash('error', 'an error occured');
        // redirect to users index
        return res.redirect('/users');
    }
}