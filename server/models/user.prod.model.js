const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    pName: {
      type: String,
      required: true,
    },
    pImageUrl: {
      type: String,
    },
    pDescription: {
      type: String,
      required: true,
    },
    pCat: {
      type: String,
      required: true,
    },
    pQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    pPrice: {
      type: Number,
      required: true,
    },
  },
  {
    strict: "throw",
    timestamps: true,
  }
);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    phNum: {
      type: String,
    },
    companyName: {
      type: String,
    },
    verifyCode: {
      type: Number,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profileImageUrl: {
      type: String,
    },
    product: {
      type: [productSchema],
    },
  },
  {
    strict: "throw",
    timestamps: true,
  }
);

const User = mongoose.model("user", userSchema);

module.exports = User;
