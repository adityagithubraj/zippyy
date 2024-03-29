// models/Dining.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const diningSchema = new Schema({

    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, // Assuming restaurants are users with a specific role


    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    time: {
        type: String,
        required: true
    }, // Could also be a Date type depending on how you want to handle it

    numberOfPeople: {
        type: Number,
        required: true
    },

    specialRequests: {
        type: String
    }, // Optional
    status: {
        type: String,
        required: true,
        enum: ['pending', 'confirmed', 'cancelled']
    }, // Reservation status
});

module.exports = mongoose.model('Dining', diningSchema);
