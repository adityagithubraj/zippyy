const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        require: true
    },

    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    number: {
        type: Number,
        require: true
    },
    address: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: true,
        default: "customer",
        enum: ['user', 'admin', 'deliveryPartner']
        
    },
    lat: { type: Number },
    lon: { type: Number }

}, { timestamps: true })

const User = mongoose.model("USER", userSchema)

module.exports = { User }

