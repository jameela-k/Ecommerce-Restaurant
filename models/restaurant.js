
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const reviewSchema = new Schema({
    comment: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: String,
    userAvatar: String
  }, {
    timestamps: true
});


const menuSchema = new Schema({
   name: {
    type: String,
    required: true,
   },
   image: {
    profile_img:{
        type: String,
    },
    cloudinary_id: {
        type: String,
    }
   },
   description: {
    type: String,
   },
   reviews: [reviewSchema],
  }, {
    timestamps: true
});


const restaurantSchema = new Schema({
   name: {
    type: String,
    required: true,
   },
   categories: [{
    type: String,
   }],
   image: {
    profile_img:{
        type: String,
    },
    cloudinary_id: {
        type: String,
    }
   },

   address: {
        shopNumber: {
            type: String,
        },
        building: {
            type: String,
        },
        road: {
            type: String,
        },
        city: {
            type: String
        },
        block: {
            type: String
        },
        country: {
            type: String
        },
   },
   menu: [menuSchema],

  }, {
    timestamps: true
});
  
module.exports = mongoose.model('Restaurant', restaurantSchema);