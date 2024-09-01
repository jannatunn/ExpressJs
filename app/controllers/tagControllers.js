const Tag = require("../models/tagModel");

// POST - Create a new Tag
const store = async (req, res, next) => {
  try {
    let payload = req.body;
    let tag = new Tag(payload);

    await tag.save();

    return res.json({
      message: "successfully added tag",
      data: tag,
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

// UPDATE - update an existing Tag
const update = async (req, res, next) => {
  try {
    let payload = req.body;
    let tag = await Tag.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      newValidators: true,
    });

    return res.json({
      message: "Tag updated successfully",
      data: tag,
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

// DELETE a Tag
const destroy = async (req, res, next) => {
  try {
    let tag = await Tag.findByIdAndDelete(req.params.id);

    return res.json({
      message: "deleted successfully",
      data: tag,
    });
  } catch (error) {
    next(error);
  }
};

// GET - Retreive a list to Tag
const index = async (req, res, next) => {
  try {
    const totalTag = await Tag.countDocuments();
    const tags = await Tag.find();

    return res.json({
      message: `Total Tag: ${totalTag}`,
      data: tags,
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
