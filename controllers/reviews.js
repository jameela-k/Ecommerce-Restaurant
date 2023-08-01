const Restaurant = require('../models/restaurant');
const User = require('../models/user');


async function create(req, res) {
  
   // Remove empty properties so that defaults will be applied
   for (let key in req.body) {
     if (req.body[key] === '') delete req.body[key];
   }
 
   try {
     const restaurant = await Restaurant.findById(req.params.res_id);
     const item = restaurant.menu.id(req.params.item_id);
     item.reviews.push(req.body);
     await restaurant.save();
     res.redirect(`/restaurants/${restaurant._id}`);
   } catch (err) {
     console.log(err);
     // res.redirect('items/new');
   }
}


async function update(req, res) {
  
   // Remove empty properties so that defaults will be applied
   for (let key in req.body) {
     if (req.body[key] === '') delete req.body[key];
   }
  
   try {
    const restaurant = await Restaurant.findById(req.params.res_id);
    const item = restaurant.menu.id(req.params.item_id);
    const review = item.reviews.id(req.params.id);

    if(review){
        review.comment = req.body.comment?req.body.comment: '';
        review.rating = req.body.rating;
    }

    await restaurant.save();

    res.redirect(`/restaurants/${req.params.res_id}`);
    } catch (err) {
        console.log(err);
        res.redirect(`/restaurants/${req.params.res_id}`);
    }
}


async function destroy(req, res) {
    try {
        const restaurant = await Restaurant.findById(req.params.res_id);
        const item = restaurant.menu.id(req.params.item_id);
        const review = item.reviews.remove(req.params.id);

        await restaurant.save();

        res.redirect(`/restaurants/${req.params.res_id}`);
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