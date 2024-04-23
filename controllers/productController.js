const User = require("../models/userModel");
const Coupon = require("../models//couponModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Brand = require("../models/brandModel");
const bcrypt = require("bcrypt");
const Orders = require("../models/orderModel");
const mime = require("mime-types");
const cloudinary = require("cloudinary").v2;
const { db } = require("../models/userModel");
let message;

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

const categoryDashboard = async (req, res) => {
  try {
    const categoryData = await Category.find();
    res.render("categoryDash", { category: categoryData, message });
    message = null;
  } catch (error) {
    console.error("Error in categoryDashboard:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const newCategory = async (req, res) => {
  try {
    res.render("new-category");
  } catch (error) {
    console.error("Error in newCategory:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const addCategory = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    if (!name || name.length < 2) {
      return res.render("new-category", { message: "Please enter a valid name" });
    }

    const existingCategory = await Category.findOne({ name: name.toLowerCase() });
    if (existingCategory) {
      return res.render("new-category", { message: "Category is already added" });
    }

    const category = new Category({ name });

    const categoryData = await category.save();

    if (categoryData) {
      res.redirect("/admin/category-dashboard");
    }
  } catch (error) {
    console.error("Error in addCategory:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const editCategoryLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const categoryData = await Category.findById(id);
    if (categoryData) {
      res.render("edit-category", { category: categoryData });
    } else {
      res.redirect("/admin/category-dashboard");
    }
  } catch (error) {
    console.error("Error in editCategoryLoad:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const updateCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const name = req.body.name?.trim();

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.render("edit-category", { message: "Category is already added" });
    }

    const categoryData = await Category.findByIdAndUpdate(
      id,
      { $set: { name } },
      { new: true }
    );
    res.redirect("/admin/category-dashboard");
  } catch (error) {
    console.error("Error in updateCategory:", error.message);
    res.status(500).send("Internal Server Error");
  }
};


////////////////////Product Controller/////////////////////////////

const productDashboard = async (req, res) => {
  try {
    const productData = await Product.find();
    res.render("productDash", { product: productData });
  } catch (error) {
    console.log(error.message);
  }
};

const addProduct = async (req, res) => {
  try {
    const categoryData = await Category.find();
    const brandData = await Brand.find();
    res.render("addProduct", { category: categoryData, brand: brandData });
  } catch (error) {
    console.log(error);
  }
};

const insertProduct = async (req, res) => {
  try {
    
    if(req.body.price<0){
      res.redirect('/admin/addProduct');
    }

    const category = await Category.findOne({ name: req.body.category });
    const brand = await Brand.findOne({ brandName: req.body.brand });

    let arrImages = [];
    if (req.files) {
      for await (const file of req.files) {
        const mimeType = mime.lookup(file.originalname);
        if (mimeType && mimeType.includes("image/")) {
          const result = await cloudinary.uploader.upload(file.path);
          arrImages.push(result.secure_url);
        } else {
          res.render("addProduct");

        }
      }
    }

    

    const product = new Product({
      productName: req.body.productName,
      price: req.body.price,
      description: req.body.description,
      quantity: req.body.quantity,
      category: category._id,
      brand: brand._id,
      status: 0,
      productImages: arrImages,
    });

    const productData = await product.save();
    if (productData) {
      res.redirect("/admin/product-dashboard");
    }
  } catch (error) {
    console.log(error);
  }
};

const productDetails = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.findOne({ _id: id })
      .populate("category")
      .populate("brand");
    res.render("productDetails", { product: productData });
  } catch (error) {
    console.log(error);
  }
};

const blockProduct = async (req, res) => {
  try {
    const id = req.query.id;
    await Product.updateOne({ _id: new Object(id) }, { $set: { status: 1 } });
    res.redirect("/admin/product-dashboard");
  } catch (error) {
    console.log(error);
  }
};

const unBlockProduct = async (req, res) => {
  try {
    const id = req.query.id;
    await Product.updateOne({ _id: new Object(id) }, { $set: { status: 0 } });
    res.redirect("/admin/product-dashboard");
  } catch (error) {
    console.log(error);
  }
};

const editProductLoad = async (req, res) => {
  
  
  try {
    const id = req.query.id;
    req.session.id = id;
    const productData = await Product.findById({ _id: id })
      .populate("brand")
      .populate("category");
    const categoryData = await Category.find();
    const brandData = await Brand.find();

    if (productData) {
      res.render("edit-product", {
        product: productData,
        category: categoryData,
        brand: brandData,
      });
    } else {
      res.redirect("/admin/product-dashboard");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateProduct = async (req, res) => {
  try {

    if(req.body.price < 1 || req.body.price == null){
     return res.redirect("/admin/product-dashboard")
    }

    const category = await Category.findOne({ name: req.body.category });
    const brand = await Brand.findOne({ brandName: req.body.brand });

    if (!category) {
      throw new Error('Category not found');
    }
    if (!brand) {
      throw new Error('Brand not found');
    }

    let arrImages = [];

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const mimeType = mime.lookup(file.originalname);
        if (mimeType && mimeType.includes("image/")) {
          const result = await cloudinary.uploader.upload(file.path);
          arrImages.push(result.secure_url);
        }
      }
    }

    const updateFields = {
      productName: req.body.productName,
      price: req.body.price,
      description: req.body.description,
      quantity: req.body.quantity,
      category: category._id,
      brand: brand._id,
      status: 0,
    };

   
    if (arrImages.length > 0) {
      updateFields.productImages = arrImages;
    }

    const productData = await Product.findOneAndUpdate(
      { _id: req.query.id },
      { $set: updateFields },
      { new: true }
    );

    if (productData) {
      res.redirect("/admin/product-dashboard");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
};


const deleteImage = async (req, res) => {
  try {
    const productId = req.query.productId;
    const index = req.query.index;
    const deletedImage = await Product.updateOne(
      { _id: productId },
      { $unset: { [`productImages.${index}`]: "" } }
    );
    const deletedImages = await Product.updateOne(
      { _id: productId },
      { $pull: { productImages: null } }
    );

    console.log(deletedImage, deletedImage);
    res.redirect("/admin/edit-product?id=" + productId);
  } catch (error) {
    console.log(error);
  }
};

////////////////////Brand Controller/////////////////////////////

const brandDashboard = async (req, res) => {
  try {
    const brandData = await Brand.find();
    res.render("brandDash", { brand: brandData, message });
    message = null;
  } catch (error) {
    console.log(error.message);
  }
};

const newBrand = async (req, res) => {
  try {
    res.render("new-brand");
  } catch (error) {
    console.log(error.message);
  }
};

const addBrand = async (req, res) => {
  try {
    const brandName = req.body.brandName;
    if (!brandName || brandName.trim().length < 2) {
      res.redirect("/admin/new-brand");
      message = "Enter a valid Brand Name";
    }
    const existingBrand = await Brand.findOne({
      brandName: req.body.brandName,
    });
    if (existingBrand) {
     res.redirect("/admin/new-brand");
      message = "Brand is Already added";
      return;
    }

    const brand = new Brand({
      brandName: brandName,
    });

    const brandData = await brand.save();

    if (brandData) {

      res.redirect("/admin/brand-dashboard");
    }
  } catch (error) {
    console.log(error);
  }
};

const editBrandLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const brandData = await Brand.findById({ _id: id });
    if (brandData) {
      res.render("edit-brand", { brand: brandData });
    } else {
      res.redirect("/admin/coupon-dashboard");
    }
  } catch (error) {
    console.log(error);
  }
};

const updateBrand = async (req, res) => {
  const id = req.query.id;

  const brandData = await Brand.findByIdAndUpdate(
    { _id: id },
    { $set: { brandName: req.body.brandName } }
  );
  res.redirect("/admin/brand-dashboard");
};

module.exports = {
  categoryDashboard,
  editCategoryLoad,
  updateCategory,
  newCategory,
  addCategory,
  productDashboard,
  addProduct,
  insertProduct,
  productDetails,
  blockProduct,
  unBlockProduct,
  editProductLoad,
  updateProduct,
  brandDashboard,
  newBrand,
  addBrand,
  editBrandLoad,
  updateBrand,
  deleteImage,
};
