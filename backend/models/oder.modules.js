
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({

    customerID: {
        type: Schema.Types.ObjectId,
        ref: 'User', required: true
    },

    foodItems: [{
        type: Schema.Types.ObjectId,
        ref: 'FOOD'
    }],

    totalPrice: {
        type: Number,
        required: true
    },

    orderStatus: {
        type: String,
        required: true,
        enum: ['pending', 'on the way', 'delivered']
    },


    assignedDeliveryPartnerID: {
        type: Schema.Types.ObjectId,
        ref: 'DeliveryPartner'
    } 
}, { timestamps: true });


const Order = mongoose.model('ORDER', orderSchema);

module.exports = { Order }
