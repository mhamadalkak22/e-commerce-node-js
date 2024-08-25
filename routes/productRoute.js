const express=require('express');
const { createProduct, getaProduct, getallProduct, updateProduct, deleteProduct, addToWishlist, rating, uploadImages} = require('../controllers/productCtrl');
const {isAdmin,authMiddleware}=require("../middlewares/authMiddleware");
const { uploadPhoto, productImgResize } = require('../middlewares/uploadimages');
const router=express.Router();
router.put("/rating",authMiddleware,rating)
router.post("/",authMiddleware,isAdmin,createProduct);
router.put("/wishlist",authMiddleware,addToWishlist)
router.get("/:id",getaProduct);
router.put("/:id",authMiddleware,isAdmin,updateProduct);
router.put('/upload/:id',authMiddleware,isAdmin,uploadPhoto.array('images',10),productImgResize,uploadImages)

router.get("/",getallProduct);
router.delete("/:id",authMiddleware,isAdmin,deleteProduct);
module.exports=router