const Blog=require('../models/blogModel')
const User=require('../models/userModel')
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");

const {cloudinaryUploadImg}=require('../utils/cloudinary')
const fs=require('fs')

const createBlog=asyncHandler(async(req,res)=>{
try {
    const newBlog=await Blog.create(req.body);
    res.json(newBlog);
    
} catch (error) {
    throw new Error(error)
}
})

const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updateBlog);
    } catch (error) {
      throw new Error(error);
    }
  });
  const getBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    
    try {
      const getBlog = await Blog.findById(id).populate("likes").populate("dislikes");
      await Blog.findByIdAndUpdate(
        id,
        {
            $inc:{numViews:1}
        },
        {new:true}
      );
      res.json(getBlog);
    } catch (error) {
      throw new Error(error);
    }
  });


  const getAllBlogs = asyncHandler(async (req, res) => {
    try {
      const getBlogs = await Blog.find();
      res.json(getBlogs);
    } catch (error) {
      throw new Error(error);
    }
  });

  const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const deleteBlog = await Blog.findByIdAndDelete(id);
      res.json(deleteBlog);
    } catch (error) {
      throw new Error(error);
    }
  });



  const likeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongoDbId(blogId);
    // Find the blog you want to like
    const blog = await Blog.findById(blogId);
    const loginUserId = req?.user?._id;
  
    // Find if the user has liked the blog
    const isLiked = blog?.isLiked;
    // Find if the user has disliked the blog
    const alreadyDisliked = blog?.dislikes?.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );
  
    if (alreadyDisliked) {
      await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { dislikes: loginUserId },
          isDisliked: false,
        },
        { new: true }
      );
    }
  
    let updatedBlog;
    if (isLiked) {
      updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { likes: loginUserId },
          isLiked: false,
        },
        { new: true }
      );
    } else {
      updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $push: { likes: loginUserId },
          isLiked: true,
        },
        { new: true }
      );
    }
  
    res.json(updatedBlog);
  });
  
  const dislikeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongoDbId(blogId);
    // Find the blog you want to dislike
    const blog = await Blog.findById(blogId);
    const loginUserId = req?.user?._id;
  
    // Find if the user has disliked the blog
    const isDisliked = blog?.isDisliked;
    // Find if the user has liked the blog
    const alreadyLiked = blog?.likes?.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );
  
    if (alreadyLiked) {
      await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { likes: loginUserId },
          isLiked: false,
        },
        { new: true }
      );
    }
  
    let updatedBlog;
    if (isDisliked) {
      updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { dislikes: loginUserId },
          isDisliked: false,
        },
        { new: true }
      );
    } else {
      updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $push: { dislikes: loginUserId },
          isDisliked: true,
        },
        { new: true }
      );
    }
  
    res.json(updatedBlog);
  });

  const uploadImagess=asyncHandler(async(req,res)=>{
    const {id}=req.params
    validateMongoDbId(id);
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
      const findBlog=await Blog.findByIdAndUpdate(
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
      res.json(findBlog);
    } catch (error) {
      throw new Error(error)
      
    }
    })
    
    
   

module.exports={createBlog,updateBlog,getBlog,getAllBlogs,deleteBlog,likeBlog,dislikeBlog,uploadImagess};