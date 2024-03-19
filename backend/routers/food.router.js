const express = require('express');
const foodRouter = express.Router();
const { Food } = require('../models/food.models');
const {authenticate} = require("../middleware/auth")
const {authorize} = require("../middleware/authorize")


// POST route to create a new food item
foodRouter.post('/createfood',authenticate,authorize("shopOwner"), async (req, res) => {
  try {
    const { name, description, price, category, imageUrl } = req.body;

    // Create a new food item
    const newFood = new Food({
      name,
      description,
      price,
      category,
      imageUrl
    });

    // Save the food item to the database
    await newFood.save();

    // Send back the created food item
    res.status(201).json(newFood);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//..............UPDATE FOOD BY ID.................//
foodRouter.put('/updatefood:id',authenticate,authorize("shopOwner"), async (req, res) => {
    try {
      const { name, description, price, category, imageUrl } = req.body;
      const food = await Food.findByIdAndUpdate(
        req.params.id,
        { name, description, price, category, imageUrl },
        { new: true } // Return the updated object
      );
      if (food) {
        res.json(food);
      } else {
        res.status(404).json({ message: 'Food not found' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  
  //...............DELETE FOOD BY ID................//

  foodRouter.delete('/deletefood:id',authenticate,authorize("shopOwner"), async (req, res) => {
    try {
      const food = await Food.findByIdAndDelete(req.params.id);
      if (food) {
        res.status(204).send(); // No content to send back
      } else {
        res.status(404).json({ message: 'Food not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

  //..................FIND SINGLE FOOD BY ID.......................//
  foodRouter.get('/findfood:id',authenticate,authorize("shopOwner"), async (req, res) => {
    try {
      const food = await Food.findById(req.params.id);
      if (food) {
        res.json(food);
      } else {
        res.status(404).json({ message: 'Food not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  
  //..................GET ALL FOOD .............................//
  foodRouter.get('/allfood', async (req, res) => {
    try {
      const foods = await Food.find();
      res.json(foods);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  


module.exports = {foodRouter};
