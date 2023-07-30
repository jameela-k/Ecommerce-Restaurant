
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: String,
    googleId: {
      type: String,
      required: true
    },
    email: String,
    avatar: String,
    userType: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    reviews: [{
      type: Schema.Types.ObjectId,
      ref: 'Restaurant'
    }]
  }, {
    timestamps: true
});
  
module.exports = mongoose.model('User', userSchema);