var express = require('express');
var router = express.Router();

const passport = require('passport');

const restaurant = require('../models/restaurant');

/* GET home page. */
router.get('/', async function(req, res, next) {
  try{
    const randomRestaurants = await restaurant.find({});
    const successMessages = req.flash('success');
    const errorMessages = req.flash('error');
    let restaurants = []
    
    //variables to randomize array
    let index = randomRestaurants.length;
    let randomIndex;

    // While there remain elements to shuffle.
    while (index != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * index);
      index--;

      // And swap it with the current element.
      [randomRestaurants[index], randomRestaurants[randomIndex]] = [randomRestaurants[randomIndex], randomRestaurants[index]];
    }

    // get only restaurants with average rating higher than 4

    for (let i=0; i<randomRestaurants.length; i++) {
      let count=0;
      let total=0;
      let avr=0;
      randomRestaurants[i].menu.forEach ((item, i) => {
        item.reviews.forEach ((review , r) => {
        total += review.rating;
        count++;
      });
      });
      if (total ===0) {
        
      }else {
        avr= total/count
        if (avr >= 4){
          restaurants.push(randomRestaurants[i]);
        }
      }
    }
    

    res.render('index', { title: 'Home Page' , restaurants, successMessages, errorMessages});
  }catch(err){
    console.log(err);
  }

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
