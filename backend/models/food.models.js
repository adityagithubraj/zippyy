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

    category: {
        type: String,
        required: true, enum: ['vase', 'non-vase']
    },

    imageUrl: {
        type: String,
        required: false
    } // Optional

}, { timestamps: true });

const Food = mongoose.model('FOOD', foodSchema);

module.exports = { Food }


