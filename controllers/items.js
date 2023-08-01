const Restaurant = require('../models/restaurant');
const cloudinary = require("../utils/cloudinary");
const mongoose = require('mongoose');



async function newItem(req, res) {
    const restaurant = await Restaurant.findById(req.params.res_id); 
    res.render("items/new", {title: 'ADD ITEM', restaurant});
}

async function create(req, res) {
  
   // Upload image to cloudinary
  if(req.file){ 
    const result = await cloudinary.uploader.upload(req.file.path);
    req.body.image = {};
    req.body.image.src = result.secure_url;
    req.body.image.cloudinary_id = result.public_id;
  }


  // Remove empty properties so that defaults will be applied
  for (let key in req.body) {
    if (req.body[key] === '') delete req.body[key];
  }

  if(req.body.price){
    req.body.price = mongoose.Types.Decimal128.fromString(req.body.price);
  }
  
  try {
    const restaurant = await Restaurant.findById(req.params.res_id);
    restaurant.menu.push(req.body);
    await restaurant.save();
    res.redirect(`/restaurants/${restaurant._id}`);
  } catch (err) {
    console.log(err);
    // res.redirect('items/new');
  }
}


async function edit(req, res) {
    const restaurant = await Restaurant.findById(req.params.res_id); 
    // const item = await Restaurant.findOne({"menu._id":req.params.id}, {"menu.$":1}); 
    const item = restaurant.menu.id(req.params.id);
    console.log("item:");
    console.log(item);
    
    res.render('items/edit', { title: 'Edit ITEM', restaurant, item});
}

async function update(req, res) {
  
    // Upload image to cloudinary
   if(req.file){ 
     const result = await cloudinary.uploader.upload(req.file.path);
     req.body.image = {};
     req.body.image.src = result.secure_url;
     req.body.image.cloudinary_id = result.public_id;
   }
 
 
   // Remove empty properties so that defaults will be applied
   for (let key in req.body) {
     if (req.body[key] === '') delete req.body[key];
   }
 
   if(req.body.price){
     req.body.price = mongoose.Types.Decimal128.fromString(req.body.price);
   }

   
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
            item.image = req.body.image?req.body.image:null;
            item.type = req.body.type? req.body.type: null;
            item.description = req.body.description?req.body.description:null;
            item.price = req.body.price?req.body.price:null;
        }

        await restaurant.save();

        res.redirect(`/restaurants/${req.params.res_id}`);
    } catch (err) {
        console.log(err);
        //  res.redirect('items/new');
    }
}


async function destroy(req, res) {
    try {
        // const result = await Restaurant.findOneAndUpdate(
        //     {_id: req.params.res_id},
        //     {$pull: {menu: {_id:req.params.id}},
        // });

        const restaurant = await Restaurant.findById(req.params.res_id);
    
        restaurant.menu.remove(req.params.id);

        await restaurant.save();

        res.redirect(`/restaurants/${req.params.res_id}`);
    }catch(err) {
        console.log(err);
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