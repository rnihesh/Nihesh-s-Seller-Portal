const exp = require("express");
const userApp = exp.Router();

const expressAsyncHandler = require("express-async-handler");
const createUser = require("./createUser.js");

const User = require("../models/user.prod.model.js");
require("dotenv").config();

// Import the email utilities
const {
  sendVerificationEmail,
  generateVerifyCode,
  setVerifyCodeExpiry,
  setNextResendTime,
  canResendOTP,
} = require("../utils/sendMail.js");

// Make sure this is at the top of the file
const { upload, cloudinary } = require("../utils/cloudinary");

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
        payload: result,
      });
    } else {
      return res.status(200).send({
        message: false,
        payload: result,
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

    const user = await User.findOne({ email: email });

    // Check if user exists
    if (!user) {
      return res
        .status(404)
        .send({ message: "User not found", payload: false });
    }

    // Check if verification code has expired
    const currentTime = new Date();
    if (!user.verifyCodeExpiry || currentTime > user.verifyCodeExpiry) {
      // Determine if user can request a new OTP right now
      const canRequestNewOtp =
        !user.resendCode || currentTime > user.resendCode;

      return res.status(410).send({
        message: "Verification code has expired. Please request a new one.",
        payload: false,
        expired: true,
        canResend: canRequestNewOtp,
        // If they can't resend now, tell them when they can
        nextResendTime: canRequestNewOtp ? null : user.resendCode,
      });
    }

    // Verify the code
    if (parseInt(code) === user.verifyCode) {
      user.isVerified = true;
      await user.save();
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

// Complete the resendOtp endpoint
userApp.post(
  "/resendotp",
  expressAsyncHandler(async (req, res) => {
    const email = req.body.email;
    const userId = req.body.userId;

    if (!email || !userId) {
      return res.status(400).send({
        message: "Email and user ID are required",
      });
    }

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).send({
          message: "User not found",
        });
      }

      if (user.email !== email) {
        return res.status(400).send({
          message: "Email does not match user record",
        });
      }

      // Check if already verified
      if (user.isVerified) {
        return res.status(400).send({
          message: "User is already verified",
        });
      }

      // Check if user can resend OTP based on resendCode Date field
      if (!canResendOTP(user)) {
        const waitTime = user.resendCode - new Date();
        const hoursToWait = Math.ceil(waitTime / (1000 * 60 * 60));

        return res.status(429).send({
          message: `You can request another OTP in ${hoursToWait} hour(s)`,
          nextResendTime: user.resendCode,
        });
      }

      const currentTime = new Date();

      // Check if the verification code has expired
      const codeExpired =
        !user.verifyCodeExpiry || currentTime > user.verifyCodeExpiry;

      // Generate new verification code and update expiry
      const newVerifyCode = generateVerifyCode();
      user.verifyCode = newVerifyCode;
      user.verifyCodeExpiry = setVerifyCodeExpiry();
      user.resendCode = setNextResendTime(); // Set next allowed resend time

      await user.save();

      // Send the email with new code
      const emailResult = await sendVerificationEmail(user, newVerifyCode);

      if (emailResult.success) {
        return res.status(200).send({
          message: "Verification code resent successfully",
          expiresAt: user.verifyCodeExpiry,
          nextResendAvailable: user.resendCode,
        });
      } else {
        return res.status(500).send({
          message: "Failed to send verification email",
          error: emailResult.message,
        });
      }
    } catch (err) {
      console.error("Error resending OTP:", err);
      return res.status(500).send({
        message: "Internal server error",
        error: err.message,
      });
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
userApp.get(
  "/products",
  expressAsyncHandler(async (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(200).send({ message: "userid required" });
    }
    const result = await User.findById(userId);
    if (!result) {
      return res.status(404).send({ message: "Not found" });
    }
    return res
      .status(200)
      .send({ message: "Products fetched", payload: result.product });
  })
);

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

      // Find the product first to get its image public ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      const product = user.product.find((p) => p.pName === pName);
      if (!product) {
        return res
          .status(404)
          .send({ message: `Product with name "${pName}" not found` });
      }

      // Delete the image from Cloudinary if it exists
      if (product.pImagePublicId) {
        await cloudinary.uploader.destroy(product.pImagePublicId);
      }

      // Now delete the product from the database
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


// Update your route with comprehensive error handling
userApp.post(
  "/upload-product-image",
  (req, res, next) => {
    // Wrap multer in a try-catch
    try {
      // Use single file upload but handle errors
      upload.single("productImage")(req, res, (err) => {
        if (err) {
          console.error("Multer error:", err);
          return res.status(400).json({
            success: false,
            message: err.message || "Error processing image file",
          });
        }
        next();
      });
    } catch (err) {
      console.error("Upload middleware error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error during file upload",
        error: err.message,
      });
    }
  },
  async (req, res) => {
    try {
      if (!req.file) {
        console.log("No file received in request");
        return res.status(400).json({
          success: false,
          message: "No image file uploaded",
        });
      }

      console.log("File successfully processed by Cloudinary:", {
        originalname: req.file.originalname,
        size: req.file.size,
        path: req.file.path,
        filename: req.file.filename,
      });

      return res.status(200).json({
        success: true,
        imageUrl: req.file.path,
        publicId: req.file.filename,
      });
    } catch (err) {
      console.error("Error in upload route handler:", err);
      return res.status(500).json({
        success: false,
        message: "Server error processing upload",
        error: err.message,
      });
    }
  }
);

module.exports = userApp;
