const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
  foodId: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const cartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  items: [cartItemSchema],
  updatedAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model('CART', cartSchema);


module.exports = { Cart }