const express = require("express");
const userRouter = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const requirelogin = require("../middleware/auth")
const { Food } = require('../models/food.models');
const { authenticate } = require("../middleware/auth")
const { authorize } = require("../middleware/authorize")
const {Cart} = require("../models/cart.model")
const { Order } = require('../models/oder.modules')


const axios = require('axios');


const { User } = require("../models/user.model");



require("dotenv").config();

const jwtkey = process.env.jwtkey



const fetchLatLngForPlace = async (address) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  
    try {
      const response = await axios.get(url);
      if (response.data.length === 0) {
        throw new Error('Place not found');
      }
      const { lat, lon } = response.data[0];
      return { lat: parseFloat(lat), lon: parseFloat(lon) };
    } catch (error) {
      console.error('Error fetching geolocation:', error);
      throw error;
    }
};

userRouter.post("/signup", async (req, res) => {
    const { name, number, email, password, role, address } = req.body;

    if (!name || !number || !email || !password || !role || !address) {
        return res.json({ msg: "Please fill in all the fields" });
    }

    try {
        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            return res.json({ msg:"User already exists with the same email. Please sign in."});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Corrected to use 'address' from 'req.body'
        const { lat, lon } = await fetchLatLngForPlace(address);

        const user = new User({
            name,
            number,
            email,
            role,
            password: hashedPassword,
            address,
            lat, 
            lon  
        });

        await user.save();
        res.json({ msg: "Signup successful" });
    } catch (error) {
        console.error(error);
        res.json({ msg: "Something went wrong", error });
    }
});


//.............signin function ............//

// userRouter.post("/signin", async (req, res) => {

//     //Stape-1 Extract user data from body
//     const { email, password } = req.body;

//     //Stape-2 Chacke all fillds are require
//     if (!email || !password) {
//         return res.status(422).json({ error: "Please fill in all the fields" });
//     }
//     // Stape-3 Chacke email is present in DB 
//     const existingUser = await User.findOne({ email: email })

//         .then((existingUser) => {
//             if (!existingUser) {
//                 return res.status(422).json({ error: "Invalid email" });
//             }

//             bcrypt.compare(password, existingUser.password)
//                 .then((match) => {
//                     if (match) {
//                         // Step-5: Generate and sign a JWT
//                         const token = jwt.sign({ _id: existingUser._id }, jwtkey);
                

//                         // Step-6: Set token in cookies
//                         res.cookie('token', token, { maxAge: 86400000, httpOnly: true });

//                         const user = User.findById(existingUser._id).select("-password");
//                         // Step-7: Return success response with the token
//                         return res.status(200).json({ message: "Signin successful", token,user });

//                     } else {
//                         return res.status(422).json({ error: "Invalid password" });
//                     }
//                 })
//                 .catch((err) => {
//                     console.error(err);
//                     return res.status(500).json({ error: "Something went wrong", err });
//                 });
//         })
//         .catch((err) => {
//             console.error(err);
//             return res.status(500).json({ error: "Something went wrong", err });
//         });
// });



//.........new singin......................//
// userRouter.post("/signin", async (req, res) => {
//     // Step 1: Extract user data from body
//     const { email, password ,role } = req.body;

//     // Step 2: Check if all fields are required
//     if (!email || !password) {
//         return res.json({msg: "Please fill in all the fields" });
//     }

//     try {
//         // Step 3: Check if the email exists in the database
//         const existingUser = await User.findOne({ email: email });

//         if (!existingUser) {
//             return res.json({ msg: "Invalid email" });
//         }

//         // Step 4: Compare passwords
//         const match = await bcrypt.compare(password, existingUser.password);

//         if (!match) {
//             return res.json({ msg: "Invalid password" });
//         }

//         // Step 5: Generate and sign a JWT
//         const token = jwt.sign({ _id: existingUser._id }, jwtkey);

//         // Step 6: Set token in cookies
//         res.cookie('token', token, { maxAge: 86400000, httpOnly: true });

//         // Step 7: Return success response with the token and user profile
//         const user = await User.findById(existingUser._id).select("-password");
//         const username = user.name
//         return res.json({ msg: "Signin successful", token, user });

//     } catch (error) {
//         console.error(error);
//         return res.json({ msg: "Something went wrong", err: error });
//     }
// });


//........singin 2................//
userRouter.post("/signin", async (req, res) => {
    // Step 1: Extract user data from body
    const { email, password, role } = req.body;

    // Step 2: Check if all fields are required
    if (!email || !password) {
        return res.json({ error: "Please fill in all the fields" });
    }

    try {
        // Step 3: Check if the email exists in the database
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.json({ msg: "Invalid email" });
        }

        // Step 4: Compare passwords
        const match = await bcrypt.compare(password, existingUser.password);

        if (!match) {
            return res.json({ msg: "Invalid password" });
        }

        // Step 5: Check if the role matches
        if (existingUser.role !== role) {
            return res.json({ msg: "Access denied: Invalid role" });
        }

        // Step 6: Generate and sign a JWT
        const token = jwt.sign({ _id: existingUser._id }, jwtkey);

        // Step 7: Set token in cookies
        res.cookie('token', token, { maxAge: 86400000, httpOnly: true });

        // Step 8: Return success response with the token and user profile
        const user = await User.findById(existingUser._id).select("-password");
        return res.json({ msg: "Sign-in successful", token, user });

    } catch (error) {
        console.error(error);
        return res.json({ error: "Internal server error" });
    }
});


// Route to get the profile of an admin user
userRouter.get("/getprofile", authenticate, async (req, res) => {
    try {
        // Ensure the user is authenticated
        if (!req.user) {
            return res.json({ error: "Unauthorized" });
        }

        // Retrieve the profile of the authenticated user
        const user = await User.findById(req.user._id).select("-password");

        // Check if the user exists
        if (!user) {
            return res.json({ error: "User not found" });
        }

        res.json({ user });
    } catch (error) {
        console.error(error);
        res.json({ error: "Something went wrong", err: error });
    }
});

//..........edit userdata................//
userRouter.patch("/editprofile", authenticate, async (req, res) => {
    try {
        // Ensure the user is authenticated
        if (!req.user) {
            return res.json({ error: "Unauthorized" });
        }

        // Retrieve the profile of the authenticated user
        const user = await User.findById(req.user._id);

        // Check if the user exists
        if (!user) {
            return res.json({ error: "User not found" });
        }

        // Update user profile data based on the request body
        const { name, number, newPassword ,profilePic} = req.body;
        user.name = name;
        user.number = number;
        user.profilePic = profilePic

        // Check if the user wants to update the password
        if (newPassword) {
            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
        }

        // Save the changes to the database
        await user.save();

        // Omit the password field from the response
        const updatedUser = { ...user.toObject(), password: undefined };

        return res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error(error);
        return resizeTo.json({ error: "Something went wrong", err: error });
    }
});


module.exports = { userRouter };

