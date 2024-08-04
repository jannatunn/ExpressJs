const path = require("path");
const fs = require("fs");
const os = require("os");
const config = require("../config");
const Product = require("../models/product");

// POST
const store = async (req, res, next) => {
  try {
    let payload = req.body;
    if (req.file) {
      let tmp_path = req.file.path; // path file berada
      let originalExt =
        req.file.originalname.split(".")[
          req.file.originalname.split(".").length - 1
        ]; // file original extetntion 
      let filename = req.file.filename + "." + originalExt; // filename and original extetntion
      let target_path = path.resolve(
        config.rootPath,
        `public/images/products/${filename}`
      ); // path saat ini

      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);
      src.pipe(dest);

      src.on("end", async () => {
        try {
          let product = new Product({ ...payload, image_url: filename });
          await product.save();
          return res.json({
            message: "successfully added a product pertama",
            data: product
          });
        } catch (error) {
          fs.unlinkSync(target_path);
          if (error && error.name === "ValidationError") {
            return res.json({
              error: 1,
              message: error.message,
              fields: error.errors,
            });
          }

          next(error);
        }
      });
      src.on("error", async (error) => {
        console.error("Error during file upload:", error);
        next(error);
      });
    } else {
      let product = new Product(payload);
      await product.save();
      return res.json({
        message: "successfully added a product kedua",
        data: product
      });
    }
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

// UPDATE
const update = async (req, res, next) => {
  try {
    let payload = req.body;
    let { id } = req.params;

    if (req.file) {
      let tmp_path = req.file.path; // path file sementara
      let originalExt = req.file.originalname.split('.').pop(); // ambil ekstensi file
      let filename = `${req.file.filename}.${originalExt}`; // nama file baru
      let target_path = path.resolve(config.rootPath, `public/images/products/${filename}`); // path tujuan

      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);
      src.pipe(dest); // pindahkan dari path sementara ke path tujuan

      src.on('end', async () => {
        try {
          // Ambil produk berdasarkan ID
          let product = await Product.findById(id);
          console.log("product 1->", product);

          // Hapus gambar saat ini jika ada
          let currentImagePath = `${config.rootPath}/public/images/products/${product.image_url}`;
          if (fs.existsSync(currentImagePath)) {
            fs.unlinkSync(currentImagePath);
            console.log(`File ${currentImagePath} berhasil dihapus.`);
          } else {
            console.log(`File ${currentImagePath} tidak ditemukan.`);
          }

          // Perbarui payload untuk menyertakan nama gambar baru
          payload.image_url = filename;

          // Lakukan pembaruan produk
          product = await Product.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true
          }); // update Product

          return res.json({
            message: "Gambar dan data produk berhasil diperbarui.",
            data: product
          });
        } catch (error) {
          fs.unlinkSync(target_path); // hapus file baru jika terjadi kesalahan
          if (error && error.name === "ValidationError") {
            return res.json({
              error: 1,
              message: error.message,
              fields: error.errors,
            });
          }
          next(error);
        }
      });

      src.on('error', (error) => {
        console.error("Error during file upload:", error);
        next(error);
      });
    } else {
      // Jika tidak ada file baru, lakukan update biasa tanpa menghapus gambar
      let product = await Product.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true
      });
      return res.json({
        message: "Data produk berhasil diperbarui tanpa mengubah gambar.",
        data: product
      });
    }
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

// GET
const index = async (req, res, next) => {
  try {
    let {skip = 0, limit = 0} = req.query;
    const totalProducts = await Product.countDocuments();
    let product = await Product.find().skip(parseInt(skip)).limit(parseInt(limit));
    return res.json({
      message: `Jumlah produk: ${totalProducts}`,
      data: product
    })
  } catch (error) {
    next(error);
  }
};

// DELETE
const destroy = async (req, res, next) => {
  try {
    let product = await Product.findByIdAndDelete(req.params.id);

    // delete the current iamge if any
    let currentImage = `${config.rootPath}/public/images/product/${product.image_url}`
    if(fs.existsSync(currentImage)){ // check if this file exists
      fs.unlinkSync(currentImage) // if there is delete the file
      console.log(`File ${currentImage} berhasil dihapus.`);
    } else {
        console.log(`File ${currentImage} tidak ditemukan.`);
    }
    return res.json({
      message: "deleted successfully",
      data: product
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  store,
  index,
  update,
  destroy
};
