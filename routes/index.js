var express = require('express');
var router = express.Router();

const passport = require('passport');

const restaurant = require('../models/restaurant');

/* GET home page. */
router.get('/', async function(req, res, next) {
  const restaurants = await restaurant.find({});
  res.render('index', { title: 'Home Page' , restaurants});
});

// Google OAuth login route
router.get('/auth/google', passport.authenticate(
  // Which passport strategy is being used?
  'google',
  {
    // Requesting the user's profile and email
    scope: ['profile', 'email'],
    // Optionally force pick account every time
    // prompt: "select_account"
  }
));

// Google OAuth callback route
router.get('/oauth2callback', passport.authenticate(
  'google',
  {
    successRedirect: '/',
    failureRedirect: '/'
  }
));

// OAuth logout route
router.get('/logout', function(req, res){
  req.logout(function() {
    res.redirect('/');
  });
});


module.exports = router;
