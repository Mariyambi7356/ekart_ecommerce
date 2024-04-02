const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  referalCode:{
    type:String,
    required: true,

  },
  mobile: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  is_admin: {
    type: Number,
    default: 0,
  },
  is_blocked: {
    type: Number,
    default: 0,
  },
  is_verified: {
    type: Number,
    default: 0,
  },
  address:{
    type:Array,
  },
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  wallet:{
    type:Number,
    default:0,
  },
  defaultAddress:{
    type:Number,
    default:0
  }
});

module.exports = mongoose.model("User", userSchema);
