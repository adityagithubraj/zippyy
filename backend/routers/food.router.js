const express = require('express');
const foodRouter = express.Router();
const { Food } = require('../models/food.models');
const { authenticate } = require("../middleware/auth")
const { authorize } = require("../middleware/authorize")
const { User } = require("../models/user.model")
const {Cart} = require("../models/cart.model")
const { Order } = require('../models/oder.modules')

const {Restaurant} = require('../models/resturent.model');



// POST route to create a new restaurant
foodRouter.post('/createrestaurant', authenticate, async (req, res) => {
 

  const { name, address, phoneNumber, isOpen } = req.body;

  try {
    const newRestaurant = new Restaurant({
      name,
      address,
      phoneNumber,
      isOpen // Adding isOpen field
    });

    await newRestaurant.save();
    res.status(201).json(newRestaurant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


//.............route for handel isopen o r not ...........//
foodRouter.patch('/restaurantstatus', async (req, res) => {
  const restaurantId = '6602695b11b3c61fb23b6a80'; // Hardcoded restaurant ID, replace with actual ID if needed

  try {
      // Find the restaurant by ID
      const restaurant = await Restaurant.findById(restaurantId);

      // Check if the restaurant exists
      if (!restaurant) {
          return res.json({ error: "Restaurant not found." });
      }

      // Toggle the status of the restaurant
      restaurant.isOpen = !restaurant.isOpen;

      // Save the changes to the database
      await restaurant.save();

      res.json({ message: "Restaurant status toggled successfully.", isOpen: restaurant.isOpen });
  } catch (error) {
      res.json({ error: "Internal server error." });
  }
});

//..................get api for reaturent ..........//
foodRouter.get('/restaurants', async (req, res) => {
  try {
      // Retrieve all restaurant data from the database
      const restaurants = await Restaurant.find();

      res.json(restaurants);
  } catch (error) {
      res.json({ error: "Internal server error." });
  }
});

// ........Route to edit restaurant data...............//

foodRouter.patch('/editrestaurant', async (req, res) => {
  const restaurantId = '6602695b11b3c61fb23b6a80'; // Hardcoded restaurant ID, replace with actual ID if needed

  try {
      // Find the restaurant by ID
      const restaurant = await Restaurant.findById(restaurantId);

      // Check if the restaurant exists
      if (!restaurant) {
          return res.json({ error: "Restaurant not found." });
      }

      // Update restaurant data with the new values from the request body
      const { name, address, phoneNumber } = req.body;
      restaurant.name = name;
      restaurant.address = address;
      restaurant.phoneNumber = phoneNumber;
   

      // Save the changes to the database
      await restaurant.save();

      res.json({ message: "Restaurant data updated successfully.", restaurant });
  } catch (error) {
      res.json({ error: "Internal server error." });
  }
});


// POST route to create a new food item

foodRouter.post('/createfood', authenticate, authorize("admin"),async (req, res) => {
  if (req.user.role !== 'admin') {
      return res.json({ error: "Unauthorized: Only restaurants Owner can add food items." });
  }

  const { name, description, price, category, imageUrl, foodType ,available} = req.body;

  try {
      const newFood = new Food({
          name,
          description,
          price,
          foodType,
          category,
          imageUrl,
          available,
          restaurantID: req.user._id // Automatically use the authenticated user's ID
      });

      await newFood.save();
      res.json(newFood);
  } catch (error) {
      res.json({ error: error.message });
  }
});


//..............UPDATE FOOD BY ID.................//
foodRouter.put('/updatefood:id', authenticate, authorize("admin"), async (req, res) => {
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
      res.json({msg: 'Food not found' });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});


//.......................edit food  avlabal or not .............//
foodRouter.patch('/foodavailability/:foodId', async (req, res) => {
  const { foodId } = req.params;
  const { available } = req.body;

  try {
      // Find the food item by ID
      const food = await Food.findById(foodId);

      // Check if the food item exists
      if (!food) {
          return res.json({ msg: "Food item not found." });
      }

      // Update the availability of the food item
      food.available = available;
      await food.save();

      res.json({ message: "Food availability updated successfully." });
  } catch (error) {
      res.json({ error: "Internal server error." });
  }
});


//...............DELETE FOOD BY ID................//

foodRouter.delete('/deletefood:id', authenticate, authorize("admin"), async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (food) {
      res.send(); // No content to send back
    } else {
      res.json({ message: 'Food not found' });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});


//..................FIND SINGLE FOOD BY ID.......................//
foodRouter.get('/findfood:id', authenticate, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (food) {
      res.json(food);
    } else {
      res.json({ message: 'Food not found' });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});


//..................GET ALL FOOD .............................//
foodRouter.get('/allfood', async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (error) {
    res.json({ error: error.message });
  }
});


//............Add to cart food.....................//


foodRouter.post('/add-to-cart', authenticate, async (req, res) => {
  const { foodId, quantity } = req.body;
  const userId = req.user._id; // Set by `authenticate` middleware
 

  try {
   
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [{ foodId, quantity }] });
    } else {
      const itemIndex = cart.items.findIndex(item => item.foodId.toString() === foodId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ foodId, quantity });
      }
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



//............Utility function to calculate total price....................//
const calculateTotalPrice = (items) => {
  return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
};


//..............place-orde......................//

foodRouter.post('/place-order', authenticate, async (req, res) => {
  const userId = req.user._id; // Assuming `authenticate` middleware correctly sets `req.user`
  const { paymentMethod, deliveryAddress } = req.body;

  try {
      const cart = await Cart.findOne({ userId });

      if (!cart || cart.items.length === 0) {
          return res.status(400).json({ error: "Your cart is empty." });
      }

      // Fetch current prices for items
      const itemsWithPrices = await Promise.all(cart.items.map(async (item) => {
          const foodItem = await Food.findById(item.foodId);
          if (!foodItem) {
              throw new Error(`Food item not found: ${item.foodId}`);
          }
          return {
              foodId: item.foodId,
              quantity: item.quantity,
              price: foodItem.price // Assuming `price` is a field on the Food model
          };
      }));

      // Calculate total price based on itemsWithPrices
      const totalPrice = calculateTotalPrice(itemsWithPrices);

      const order = new Order({
          customerID: userId,
          items: itemsWithPrices,
          totalPrice,
          paymentMethod,
          orderStatus: 'pending',
          deliveryAddress
      });

      await order.save();
      await Cart.findByIdAndDelete(cart._id); // Optionally clear the cart after placing the order

      res.status(201).json({ order });
  } catch (error) {
      console.error(error); // Logging the error can help with debugging
      res.status(500).json({ error: error.message });
  }
});


//................Accept or reject order route .................//
foodRouter.post('/accept-reject/:orderId', authenticate, authorize('admin'), async (req, res) => {
  const { orderId } = req.params;
  const { action } = req.body; // 'accept' or 'reject'

  try {
      const order = await Order.findById(orderId);
      if (!order) {
          return res.status(404).json({ error: "Order not found." });
      }

      if (action === 'accept') {
          order.orderStatus = 'accepted';
      } else if (action === 'reject') {
          order.orderStatus = 'cancelled';
      } else {
          return res.status(400).json({ error: "Invalid action." });
      }

      await order.save();
      res.json(order);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});


//............Asinge delivry partner .................//

foodRouter.post('/assign-delivery-partner/:orderId', authenticate, authorize('admin'), async (req, res) => {
  const { orderId } = req.params;
  const { deliveryPartnerId } = req.body;

  try {
      const order = await Order.findById(orderId);
      if (!order) {
          return res.status(404).json({ error: "Order not found." });
      }

      order.assignedDeliveryPartnerID = deliveryPartnerId;
      order.orderStatus = 'on the way'; // Optionally update the status here

      await order.save();
      res.json(order);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});


module.exports = { foodRouter };
