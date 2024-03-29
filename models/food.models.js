// models/Food.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const foodSchema = new Schema({

    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    foodType: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true,
    },

    imageUrl: {
        type: String,
        required: false
    } ,// Optional

    restaurantID: { // This field associates the food item with a specific restaurant or shop owner
        type: Schema.Types.ObjectId,
        ref: 'User', // Assuming restaurants are stored in the 'User' collection but with a specific role indicating they are restaurants
        required: true
      },

      available: {
        type: Boolean,
        required: false,
        default: true // Assuming by default it's available
    }

}, { timestamps: true });

const Food = mongoose.model('FOOD', foodSchema);

module.exports = { Food }


