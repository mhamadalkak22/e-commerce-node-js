const express=require('express');
const { createCategory, updateCategory, deleteCategory, getCategory, getallCategory } = require('../controllers/blogCatCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { getaProduct } = require('../controllers/productCtrl');

const router=express.Router();





router.post('/',authMiddleware,isAdmin,createCategory)

router.put('/:id',authMiddleware,isAdmin,updateCategory)

router.delete('/:id',authMiddleware,isAdmin,deleteCategory)

router.get('/:id',getCategory)
router.get('/',getallCategory);




module.exports=router