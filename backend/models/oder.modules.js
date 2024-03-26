const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
  foodId: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
}, { _id: false });

const orderSchema = new Schema({
  customerID: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalPrice: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['pending', 'accepted', 'on the way', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cashOnDelivery', 'card']
  },
  assignedDeliveryPartnerID: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  placedAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: {
    type: Date
  }
}, { timestamps: true });

const Order = mongoose.model('ORDER', orderSchema);

module.exports = {Order}
