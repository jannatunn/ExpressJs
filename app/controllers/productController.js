const path = require("path");
const fs = require("fs");
const os = require("os");
const config = require("../config");
const Product = require("../models/productModel");

// POST - Create a new product
const store = async (req, res, next) => {
  try {
    let payload = req.body; // Retrieve the request body (product details)

    // Check if a file has been uploaded
    if (req.file) {
      let tmp_path = req.file.path; // Temporary path of the uploaded file
      let originalExt = req.file.originalname.split(".").pop(); // Get the original file extension
      let filename = req.file.filename + "." + originalExt; // Create a new filename with original extension
      let target_path = path.resolve(
        config.rootPath,
        `public/images/products/${filename}`
      ); // Set the target path where the file will be saved

      const src = fs.createReadStream(tmp_path); // Create a read stream from the temporary file
      const dest = fs.createWriteStream(target_path); // Create a write stream to the target path
      src.pipe(dest); // Pipe the read stream to the write stream

      src.on("end", async () => { // Listen for the end of the stream
        try {
          // Create a new product with the uploaded image filename
          let product = new Product({ ...payload, image_url: filename });
          await product.save(); // Save the product to the database

          return res.json({
            message: "successfully added a product first",
            data: product
          });
        } catch (error) {
          fs.unlinkSync(target_path); // Delete the file if saving the product fails
          
          // Handle validation errors
          if (error && error.name === "ValidationError") {
            return res.json({
              error: 1,
              message: error.message,
              fields: error.errors,
            });
          }

          next(error); // Pass any other errors to the error handler
        }
      });

      src.on("error", async (error) => { // Handle stream errors
        console.error("Error during file upload:", error);
        next(error);
      });
    } else {
      // If no file is uploaded, create the product without an image
      let product = new Product(payload);
      await product.save(); // Save the product to the database
      return res.json({
        message: "successfully added a product second",
        data: product
      });
    }
  } catch (error) {
    // Handle validation errors
    if (error && error.name === "ValidationError") {
      return res.json({
        error: 1,
        message: error.message,
        fields: error.errors,
      });
    }

    next(error); // Pass any other errors to the error handler
  }
};

// UPDATE - Update an existing product
const update = async (req, res, next) => {
  try {
    let payload = req.body; // Retrieve the request body
    let { id } = req.params; // Get the product ID from request parameters

    // Check if a new file is uploaded
    if (req.file) {
      let tmp_path = req.file.path; // Temporary path of the uploaded file
      let originalExt = req.file.originalname.split('.').pop(); // Get the original file extension
      let filename = `${req.file.filename}.${originalExt}`; // Create a new filename
      let target_path = path.resolve(config.rootPath, `public/images/products/${filename}`); // Set the target path

      const src = fs.createReadStream(tmp_path); // Create a read stream from the temporary file
      const dest = fs.createWriteStream(target_path); // Create a write stream to the target path
      src.pipe(dest); // Pipe the read stream to the write stream

      src.on('end', async () => { // Listen for the end of the stream
        try {
          // Find the product by ID
          let product = await Product.findById(id);
          console.log("product 1->", product); // Log the product for debugging

          // Delete the current image if it exists
          let currentImagePath = `${config.rootPath}/public/images/products/${product.image_url}`;
          if (fs.existsSync(currentImagePath)) {
            fs.unlinkSync(currentImagePath); // Delete the current image
            console.log(`File ${currentImagePath} deleted successfully.`);
          } else {
            console.log(`File ${currentImagePath} not found.`);
          }

          // Update the payload to include the new image filename
          payload.image_url = filename;

          // Update the product in the database
          product = await Product.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true // Run validation on the updated fields
          });

          return res.json({
            message: "Image and product data updated successfully.",
            data: product
          });
        } catch (error) {
          fs.unlinkSync(target_path); // Delete the new file if an error occurs
          
          // Handle validation errors
          if (error && error.name === "ValidationError") {
            return res.json({
              error: 1,
              message: error.message,
              fields: error.errors,
            });
          }
          next(error); // Pass any other errors to the error handler
        }
      });

      src.on('error', (error) => { // Handle stream errors
        console.error("Error during file upload:", error);
        next(error);
      });
    } else {
      // If no new file is uploaded, update the product without changing the image
      let product = await Product.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true // Run validation on the updated fields
      });
      return res.json({
        message: "Product data updated successfully without changing the image.",
        data: product
      });
    }
  } catch (error) {
    // Handle validation errors
    if (error && error.name === "ValidationError") {
      return res.json({
        error: 1,
        message: error.message,
        fields: error.errors,
      });
    }
    next(error); // Pass any other errors to the error handler
  }
};

// GET - Retrieve a list of products
const index = async (req, res, next) => {
  try {
    let { skip = 0, limit = 0 } = req.query; // Retrieve pagination parameters from query
    const totalProducts = await Product.countDocuments(); // Get the total number of products
    let product = await Product.find().skip(parseInt(skip)).limit(parseInt(limit)); // Retrieve products with pagination

    return res.json({
      message: `Total products: ${totalProducts}`,
      data: product // Return the list of products
    });
  } catch (error) {
    next(error); // Pass any errors to the error handler
  }
};

// DELETE - Delete a product
const destroy = async (req, res, next) => {
  try {
    // Find and delete the product by ID
    let product = await Product.findByIdAndDelete(req.params.id);

    // Delete the current image if it exists
    let currentImage = `${config.rootPath}/public/images/products/${product.image_url}`; // Set the path of the current image
    if (fs.existsSync(currentImage)) { // Check if the image file exists
      fs.unlinkSync(currentImage); // Delete the image file
      console.log(`File ${currentImage} deleted successfully.`);
    } else {
      console.log(`File ${currentImage} not found.`);
    }

    return res.json({
      message: "Deleted successfully",
      data: product // Return the deleted product data
    });
  } catch (error) {
    next(error); // Pass any errors to the error handler
  }
}

module.exports = {
  store,
  index,
  update,
  destroy
};
