const Category = require("../models/categoryModel");

// POST - Create a new Category
const store = async (req, res, next) => {
  try {
    let payload = req.body; //Retreive the request body (category detail)
    let category = new Category(payload); // Create a new instance of the Category model with the payload data

    await category.save(); // save the new category instance

    // Return a success response with the created category data
    return res.json({
      message: "successfully added categories",
      data: category,
    });
  } catch (error) {
    if (error && error.name === "ValidationError") {
      return res.json({
        error: 1,
        message: error.message,
        fields: error.errors,
      });
    }
    next(error);
  }
};

// UPDATE - update an existing category
const update = async (req, res, next) => {
  try {
    let payload = req.body;
    let category = await Category.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      newValidators: true,
    });

    return res.json({
      message: "category updated successfully",
      data: category,
    });
  } catch (error) {
    if (error && error.name === "ValidationError") {
      return res.json({
        message: 1,
        error: error.message,
        fields: error.errors,
      });
    }
  }
};

// DELETE a category
const destroy = async (req, res, next) => {
  try {
    let category = await Category.findByIdAndDelete(req.params.id);

    return res.json({
      message: "deleted successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// GET - Retreive a list to category
const index = async (req, res, next) => {
  try {
    const totalCategory = await Category.countDocuments();
    const categories = await Category.find();

    return res.json({
      message: `Total category: ${totalCategory}`,
      data: categories,
    });
  } catch (error) {
    if (error && error.name === "ValidationError") {
      return res.json({
        message: 1,
        error: error.message,
        fields: error.errors,
      });
    }
  }
};

module.exports = {
  store,
  update,
  index,
  destroy
};
