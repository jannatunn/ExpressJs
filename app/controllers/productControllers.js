const path = require("path");
const fs = require("fs");
const config = require("../config");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Tags = require("../models/tagModel");

// POST - Create a new product
const store = async (req, res) => {
  try {
    let payload = req.body;

    // Validasi nama produk
    const existingProduct = await Product.findOne({ name: payload.name });
    console.log("existingProduct ->", existingProduct);
    if (existingProduct) {
      return res.status(400).json({
        message: "Nama produk sudah ada"
      });
    }

    // Validasi kategori
    if (payload.category) {
      let category = await Category.findOne({
        name: { $regex: payload.category, $options: "i" },
      });
      if (category) {
        payload.category = category._id;
      } else {
        delete payload.category;
      }
    }

    // Validasi tag
    if (payload.tags && payload.tags.length > 0) {
      let tags = await Tags.find({ name: { $in: payload.tags } });
      if (tags.length) {
        payload.tags = tags.map(tag => tag._id);
      } else {
        delete payload.tags;
      }
    }

    if (req.file) {
      let tmp_path = req.file.path;
      let originalExt = req.file.originalname.split(".").pop();
      let filename = req.file.filename + "." + originalExt;
      let target_path = path.resolve(
        config.rootPath,
        `public/images/products/${filename}`
      );

      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);
      src.pipe(dest);

      src.on("end", async () => {
        try {
          let product = new Product({ ...payload, image_url: filename });
          await product.save();

          return res.status(201).json({
            message: "Product successfully added",
            data: product,
          });
        } catch (error) {
          fs.unlinkSync(target_path);

          if (error.name === "ValidationError") {
            return res.status(400).json({
              message: "Validation error",
              errors: error.errors,
            });
          }

          return res.status(500).json({
            message: "Internal server error",
            error: error.message,
          });
        }
      });

      src.on("error", (error) => {
        console.error("Error during file upload:", error);
        return res.status(500).json({
          message: "Error during file upload",
          error: error.message,
        });
      });
    } else {
      let product = new Product(payload);
      await product.save();
      return res.status(201).json({
        message: "Product successfully added without image",
        data: product,
      });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// UPDATE - Update an existing product
const update = async (req, res) => {
  try {
    let payload = req.body;
    let { id } = req.params;

    if (payload.category) {
      let category = await Category.findOne({
        name: { $regex: payload.category, $options: "i" },
      });
      if (category) {
        payload.category = category._id;
      } else {
        delete payload.category;
      }
    }

    if (req.file) {
      let tmp_path = req.file.path;
      let originalExt = req.file.originalname.split(".").pop();
      let filename = `${req.file.filename}.${originalExt}`;
      let target_path = path.resolve(
        config.rootPath,
        `public/images/products/${filename}`
      );

      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);
      src.pipe(dest);

      src.on("end", async () => {
        try {
          let product = await Product.findById(id);

          let currentImagePath = `${config.rootPath}/public/images/products/${product.image_url}`;
          if (fs.existsSync(currentImagePath)) {
            fs.unlinkSync(currentImagePath);
          }

          payload.image_url = filename;

          product = await Product.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true,
          });

          return res.status(200).json({
            message: "Product updated successfully with new image",
            data: product,
          });
        } catch (error) {
          fs.unlinkSync(target_path);

          if (error.name === "ValidationError") {
            return res.status(400).json({
              message: "Validation error",
              errors: error.errors,
            });
          }
          return res.status(500).json({
            message: "Internal server error",
            error: error.message,
          });
        }
      });

      src.on("error", (error) => {
        console.error("Error during file upload:", error);
        return res.status(500).json({
          message: "Error during file upload",
          error: error.message,
        });
      });
    } else {
      let product = await Product.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      });
      return res.status(200).json({
        message: "Product data updated successfully without changing the image",
        data: product,
      });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// GET - Retrieve a list of products
// const index = async (req, res) => {
//   try {
//     let { skip = 0, limit = 0, q = "", category = "", tags = [] } = req.query;
//     let criteria = {};

//     if (q.length) {
//       criteria.name = { $regex: `${q}`, $options: 'i' };
//     }

//     if (category.length) {
//       const categoryResult = await Category.findOne({ name: { $regex: `${category}`, $options: 'i' } });
//       if (categoryResult) {
//         criteria.category = categoryResult._id;
//       } else {
//         return res.status(404).json({
//           message: 'No products found',
//           data: []
//         });
//       }
//     }

//     if (tags.length) {
//       const tagsResult = await Tags.find({ name: { $in: tags } });
//       if (tagsResult.length > 0) {
//         criteria.tags = { $in: tagsResult.map(tag => tag._id) };
//       } else {
//         return res.status(404).json({
//           message: 'No products found',
//           data: []
//         });
//       }
//     }

//     const count = await Product.countDocuments(criteria);

//     if (count === 0) {
//       return res.status(404).json({
//         message: 'No products found',
//         data: []
//       });
//     }

//     const products = await Product.find(criteria)
//       .skip(parseInt(skip))
//       .limit(parseInt(limit))
//       .populate("category");

//     return res.status(200).json({
//       message: `Total: ${count} product`,
//       data: products,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };
const index = async (req, res) => {
  try {
    let { skip = 0, limit = 0, q = "", category = "", tags = [] } = req.query;

    // Validasi input query
    skip = parseInt(skip) || 0;
    limit = parseInt(limit) || 0;
    tags = Array.isArray(tags) ? tags : [];

    let criteria = {};

    if (q.length) {
      criteria.name = { $regex: `${q}`, $options: 'i' };
    }

    if (category.length) {
      const categoryResult = await Category.findOne({ name: { $regex: `${category}`, $options: 'i' } });
      if (categoryResult) {
        criteria.category = categoryResult._id;
      } else {
        return res.status(404).json({
          message: 'No products found',
          data: []
        });
      }
    }

    if (tags.length) {
      const tagsResult = await Tags.find({ name: { $in: tags } });
      if (tagsResult.length > 0) {
        criteria.tags = { $in: tagsResult.map(tag => tag._id) };
      } else {
        return res.status(404).json({
          message: 'No products found',
          data: []
        });
      }
    }

    const count = await Product.countDocuments(criteria);

    if (count === 0) {
      return res.status(404).json({
        message: 'No products found',
        data: []
      });
    }

    const products = await Product.find(criteria)
      .skip(skip)
      .limit(limit)
      .populate("category");

    return res.status(200).json({
      message: `Total: ${count} product(s)`,
      data: products,
    });
  } catch (error) {
    console.error("Error in index function:", error); // Menambahkan log error untuk debugging
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


// DELETE - Delete a product
const destroy = async (req, res) => {
  try {
    let product = await Product.findByIdAndDelete(req.params.id);

    if (product && product.image_url) {
      let currentImagePath = `${config.rootPath}/public/images/products/${product.image_url}`;
      if (fs.existsSync(currentImagePath)) {
        fs.unlinkSync(currentImagePath);
      }
    }

    return res.status(200).json({
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  store,
  index,
  update,
  destroy,
};
