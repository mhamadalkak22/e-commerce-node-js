const express=require('express');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, likeBlog, dislikeBlog, uploadImagess } = require('../controllers/blogCtrl');
const { blogImgResize, uploadPhoto } = require('../middlewares/uploadimages');
const { uploadImages } = require('../controllers/productCtrl');
const router=express.Router();

router.put('/dislikes',authMiddleware,dislikeBlog)

router.put('/likes',authMiddleware,likeBlog)

router.post('/',authMiddleware,isAdmin,createBlog)
router.put('/upload-image/:id',authMiddleware,isAdmin,uploadPhoto.array('images',2),blogImgResize,uploadImagess)

router.put('/:id',authMiddleware,isAdmin,updateBlog)
router.get('/:id',getBlog)
router.get('/',getAllBlogs)
router.delete('/:id',authMiddleware,isAdmin,deleteBlog);













module.exports=router