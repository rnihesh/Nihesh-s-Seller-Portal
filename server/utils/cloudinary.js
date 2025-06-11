const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test connection
cloudinary.api.ping((error, result) => {
  if (error) {
    console.error("Cloudinary connection failed:", error.message);
  } else {
    console.log("Cloudinary connection successful:", result.status);
  }
});

// Configure storage with wider format support
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "seller_portal_products",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"], // Added webp explicitly
    transformation: [{ width: 800, height: 600, crop: "limit" }],
  },
});

// Configure multer middleware with error handling
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

module.exports = {
  upload,
  cloudinary,
};
