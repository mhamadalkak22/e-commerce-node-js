const { Error } = require('mongoose')
const Product=require('../models/productModel')
const asyncHandler=require('express-async-handler')
const slugify=require("slugify")
const User=require('../models/userModel')
const { JSONCookie } = require('cookie-parser')
const { cloudinaryUploadImg } = require('../utils/cloudinary'); 
const validateMongodbId = require('../utils/validateMongodbid'); 
const mongoose=require("mongoose");
const fs=require('fs');



const createProduct=asyncHandler(async(req,res)=>{

try {
if(req.body.title){
    req.body.slug=slugify(req.body.title)
}
const newProduct=await Product.create(req.body)
res.json(newProduct)
} catch (error) {
    throw new Error(error)
    
}
})


const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
 if (req.body.title) {
        req.body.slug = slugify(req.body.title);
      }
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: id },
        req.body,
        { new: true }
      );
   if (!updatedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(updatedProduct);
    } catch (error) {
      console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
  });


  const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedProduct = await Product.findOneAndDelete({ _id: id });
  
      if (!deletedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      res.json(deletedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  

const getaProduct=asyncHandler(async(req,res)=>{
const {id}=req.params;
try {
    const findProduct=await Product.findById(id);
    res.json(findProduct)
} catch (error) {
    
}
})
const getallProduct=asyncHandler(async(req,res)=>{
    try {
      //filtring
      const queryObj={...req.query};
      const excludeFields=['page','sort','limit','fields']
      excludeFields.forEach((el)=>delete queryObj[el])
      console.log(queryObj)
      let queryStr=JSON.stringify(queryObj)
      queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match=>`$${match}`)
      let query=Product.find(JSON.parse(queryStr));

      //sorting 
    if(req.query.sort){
     const sortBy=req.query.sort.split(",").join(" ")
     query=query.sort(sortBy)
    }else{
      query = query.sort('-createdAt');

    }

//limiting the fildes
    if(req.query.fields){
      const fields=req.query.fields.split(",").join(" ");
        query = query.select(fields);
  } else {
    query = query.select('-__v');

    }

 //pagination
 
 const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query=query.skip(skip).limit(limit)
    if(req.query.page){
      const productCount=await Product.countDocuments();
      if(skip>=productCount) throw new Error('This page does not exits')
    }
      
      const product=await query;
        res.json(product)
    } catch (error) {
        throw new Error(error)
    }

})



const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;

  // Validate user ID and product ID
  validateMongodbId(_id);
  validateMongodbId(prodId);

  try {
    // Convert prodId to ObjectId using 'new'
    const prodObjectId = new mongoose.Types.ObjectId(prodId);

    // Find the user
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the product is already in the wishlist
    const alreadyAdded = user.wishlist.some((id) => id.equals(prodObjectId));

    if (alreadyAdded) {
      // Remove from wishlist
      const updatedUser = await User.findByIdAndUpdate(
        _id,
        { $pull: { wishlist: prodObjectId } },
        { new: true }
      );
      res.json(updatedUser);
    } else {
      // Add to wishlist
      const updatedUser = await User.findByIdAndUpdate(
        _id,
        { $push: { wishlist: prodObjectId } },
        { new: true }
      );
      res.json(updatedUser);
    }
  } catch (error) {
    console.error('Error:', error); // Log the error
    res.status(500).json({ message: error.message });
  }
});



const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user; // User ID
  const { star, prodId, comment } = req.body; // Rating details and Product ID

  try {
    // Validate prodId to ensure it's a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(prodId)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    // Convert prodId to ObjectId
    const productId = new mongoose.Types.ObjectId(prodId);

    // Find the product by ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the user has already rated this product
    let alreadyRated = product.ratings.find(
      (rating) => rating.postedby.toString() === _id.toString()
    );

    if (alreadyRated) {
      // Update existing rating
      await Product.updateOne(
        {
          _id: productId,
          "ratings.postedby": _id,
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        { new: true }
      );
    } else {
      // Add a new rating
      await Product.findByIdAndUpdate(
        productId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedby: _id,
            },
          },
        },
        { new: true }
      );
    }

    // Recalculate the average rating and update the product
    const updatedProduct = await Product.findById(productId);
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    let totalRating = updatedProduct.ratings.length;
    let ratingsSum = updatedProduct.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = totalRating > 0 ? Math.round(ratingsSum / totalRating) : 0;

    // Update the product with the new average rating
    const finalProduct = await Product.findByIdAndUpdate(
      productId,
      { totalrating: actualRating },
      { new: true }
    );

    res.json(finalProduct);
  } catch (error) {
    console.error("Error updating rating:", error);
    res.status(500).json({ message: error.message });
  }
});

const uploadImages=asyncHandler(async(req,res)=>{
  const {id}=req.params
  validateMongodbId(id);
  try {
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      console.log(newpath);
      urls.push(newpath);
  
  
    }
    const findProduct=await Product.findByIdAndUpdate(
      id,
      {
        images : urls.map((file) => {
          return file;
        }),
      },
      {
        new:true
      }
    );
    res.json(findProduct);
  } catch (error) {
    throw new Error(error)
    
  }
  })



module.exports={createProduct,getaProduct,getallProduct,updateProduct,deleteProduct,addToWishlist,rating,uploadImages}