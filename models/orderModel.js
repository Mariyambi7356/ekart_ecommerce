const mongoose = require("mongoose");
const orderSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  item: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        required: true,
      },
      isCancel: {
        type: Boolean,
        default: false,
      }
    },
  ],
  start_date: {
    type: Date,
    default:Date.now()
  },
  delivered_date: {
    type: Date,
  },
  totalPrice: {
    type: String,
  },
  is_delivered: {
    type: Boolean,
    default: false,
  },
  user_cancelled: {
    type: Boolean,
    default: false,
  },
  
  
  admin_cancelled: {
    type: Boolean,
    default: false,
  },
  orderCount: {
    type: Number,
    default: 0,
  },
  is_returned: {
    type: Number,
    default: false,
  },
  address: {
    type: Array,
  },
  couponDetails:{
    type:String,
  },
  discountAmount:{
    type:Number
  },
  paymentType: {
    type: String,
    default: 0,
  },
  orderId:{
    type:String,
  },
  deliveryCharge:{
    type:Number,
    default:40,
  }
});

module.exports = mongoose.model("Orders", orderSchema);
