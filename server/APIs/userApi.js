const exp = require("express");
const userApp = exp.Router();

const expressAsyncHandler = require("express-async-handler");
const createUser = require("./createUser.js");

const User = require("../models/user.prod.model.js");
require("dotenv").config();

//creating user
userApp.post("/user", expressAsyncHandler(createUser));

//verify user check
userApp.get(
  "/verify",
  expressAsyncHandler(async (req, res) => {
    const { email } = req.query;

    // Check if email is provided
    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    const result = await User.findOne({ email: email });

    // Check if user exists
    if (!result) {
      return res.status(404).send({ message: "User not found" });
    }

    if (result.isVerified === true) {
      return res.status(200).send({
        message: true,
        payload: result
      });
    } else {
      return res.status(200).send({
        message: false,
        payload: result
      });
    }
  })
);

//to verify
userApp.post(
  "/verifyuser",
  expressAsyncHandler(async (req, res) => {
    const email = req.body.email || req.query.email;
    const code = req.body.code || req.query.code;

    if (!email || !code) {
      return res
        .status(400)
        .send({ message: "Email and verification code are required" });
    }

    const result = await User.findOne({ email: email });

    // Check if user exists
    if (!result) {
      return res
        .status(404)
        .send({ message: "User not found", payload: false });
    }

    if (result.verifyCode === code) {
      result.isVerified = true;
      await result.save();
      return res
        .status(200)
        .send({ message: "Account verified successfully", payload: true });
    } else {
      return res
        .status(400)
        .send({ message: "Invalid verification code", payload: false });
    }
  })
);

//uploading product
userApp.post(
  "/product",
  expressAsyncHandler(async (req, res) => {
    try {
      const { userId, product } = req.body;

      // Validate inputs
      if (!userId || !product) {
        return res.status(400).send({
          message: "User ID and product details are required",
        });
      }

      const result = await User.findByIdAndUpdate(
        userId,
        { $push: { product: product } },
        { new: true, runValidators: true }
      );

      // Check if user exists
      if (!result) {
        return res.status(404).send({ message: "User not found" });
      }

      // Return the updated user document with the new product
      return res.status(201).send({
        message: "Product added successfully",
        payload: {
          userId: result._id,
          addedProduct: result.product[result.product.length - 1],
        },
      });
    } catch (error) {
      console.log("Error adding product:", error);

      // Handle validation errors
      if (error.name === "ValidationError") {
        return res.status(400).send({
          message: "Validation error",
          error: error.message,
        });
      }

      // Handle other errors
      return res.status(500).send({
        message: "Internal server error",
        error: error.message,
      });
    }
  })
);

//get products
userApp.get("/products", expressAsyncHandler(async (req, res)=>{
  const userId = req.query.userId;
  if(!userId){
    return res.status(200).send({message: "userid required"})
  }
  const result = await User.findById(userId)
  if(!result){
    return res.status(404).send({message: "Not found"})
  }
  return res.status(200).send({message: "Products fetched", payload: result.product})


}))

//editing product
userApp.put(
  "/edit",
  expressAsyncHandler(async (req, res) => {
    try {
      const { userId, pName, updatedProduct } = req.body;

      // Find the user by ID
      const user = await User.findById(userId);

      // Check if user exists
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      // Find the product index by name
      const productIndex = user.product.findIndex((p) => p.pName === pName);

      // Check if product exists
      if (productIndex === -1) {
        return res.status(404).send({
          message: `Product with name "${pName}" not found`,
        });
      }

      // Update the product fields
      Object.keys(updatedProduct).forEach((key) => {
        if (key !== "_id") {
          // Prevent updating _id field
          user.product[productIndex][key] = updatedProduct[key];
        }
      });

      // Save the updated user document
      await user.save();

      return res.status(200).send({
        message: "Product updated successfully",
        payload: {
          userId: user._id,
          updatedProduct: user.product[productIndex],
        },
      });
    } catch (error) {
      console.log("Error updating product:", error);

      // Handle validation errors
      if (error.name === "ValidationError") {
        return res.status(400).send({
          message: "Validation error",
          error: error.message,
        });
      }

      // Handle other errors
      return res.status(500).send({
        message: "Internal server error",
        error: error.message,
      });
    }
  })
);

//deleting product
userApp.delete(
  "/delete",
  expressAsyncHandler(async (req, res) => {
    try {
      const { userId, pName } = req.body;

      // Find the user and update to pull the product with matching pName
      const result = await User.findByIdAndUpdate(
        userId,
        { $pull: { product: { pName: pName } } },
        { new: true }
      );

      // Check if user exists
      if (!result) {
        return res.status(404).send({ message: "User not found" });
      }

      // Check if any product was removed
      // Compare the initial and final lengths
      const previousLength = req.body.previousLength;
      if (previousLength && result.product.length === previousLength) {
        return res.status(404).send({
          message: `Product with name "${pName}" not found`,
        });
      }

      return res.status(200).send({
        message: "Product deleted successfully",
        payload: {
          userId: result._id,
          remainingProductsCount: result.product.length,
        },
      });
    } catch (error) {
      console.log("Error deleting product:", error);

      // Handle other errors
      return res.status(500).send({
        message: "Internal server error",
        error: error.message,
      });
    }
  })
);

//update pQuantity
userApp.patch(
  "/updateQuantity",
  expressAsyncHandler(async (req, res) => {
    try {
      const { userId, pName, op } = req.body;


      // Find the user by ID
      const user = await User.findById(userId);

      // Check if user exists
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      // Find the product index by name
      const productIndex = user.product.findIndex((p) => p.pName === pName);

      // Check if product exists
      if (productIndex === -1) {
        return res.status(404).send({
          message: `Product with name "${pName}" not found`,
        });
      }

      // Update quantity based on operation type
      if (op === true) {
        // Increment quantity
        user.product[productIndex].pQuantity += 1;
      } else {
        // Decrement quantity, but don't go below 0
        if (user.product[productIndex].pQuantity > 0) {
          user.product[productIndex].pQuantity -= 1;
        } else {
          return res.status(400).send({
            message: "Cannot decrease quantity below 0",
            payload: {
              userId: user._id,
              product: user.product[productIndex],
            },
          });
        }
      }

      // Save the updated user document
      await user.save();

      // Return the updated product with new quantity
      return res.status(200).send({
        message: op === true ? "Quantity increased" : "Quantity decreased",
        payload: {
          userId: user._id,
          product: user.product[productIndex],
        },
      });
    } catch (error) {
      console.log("Error updating product quantity:", error);

      // Handle validation errors
      if (error.name === "ValidationError") {
        return res.status(400).send({
          message: "Validation error",
          error: error.message,
        });
      }

      // Handle other errors
      return res.status(500).send({
        message: "Internal server error",
        error: error.message,
      });
    }
  })
);

module.exports = userApp;
