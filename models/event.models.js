// models/Event.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({

    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, // Assuming restaurants are users with a specific role

    organizerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    eventName: {
        type: String,
        required: true
    },

    eventDate: {
        type: Date,
        required: true
    },

    startTime: {
        type: String,
        required: true
    }, // Could also be a Date type


    endTime: {
        type: String,
        required: true
    }, // Could also be a Date type

    numberOfPeople: {
        type: Number,
        required: true
    },

    description: {
        type: String,
        required: true
    }, // Describe the event

    specialRequirements: {
        type: String
    }, // Optional

    status: {
        type: String,
        required: true,
        enum: ['pending', 'confirmed', 'cancelled']
    }, // Event status

});

module.exports = mongoose.model('Event', eventSchema);
