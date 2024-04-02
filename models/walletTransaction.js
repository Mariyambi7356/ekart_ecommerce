const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0, 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  debit:{
    type:Boolean
  }

},{
    timestamps:true
});

module.exports = mongoose.model("Wallet", walletSchema);
