const express=require('express');
const bodyParser=require('body-parser')
const app=express()
const dotenv=require("dotenv").config()
const PORT=process.env.PORT || 4000;
const connectDB=require("./config/dbConnect")
const authRouter=require('./routes/authroutes');
const productRouter=require('./routes/productRoute')
const blogRouter=require('./routes/blogRoute')
const categoryRouter=require('./routes/prodcategoryRoute')
const blogcategoryRouter=require('./routes/blogCatRoute')
const brandRouter=require('./routes/BrandRoute')
const couponRouter=require('./routes/couponRoute')
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const cookieParser=require('cookie-parser');
const morgan=require("morgan")
connectDB();

app.use(morgan('dev'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}))
app.use(cookieParser());
app.use('/api/user',authRouter)
app.use('/api/product',productRouter)
app.use('/api/blog',blogRouter)
app.use('/api/category',categoryRouter)
app.use('/api/blogcategory',blogcategoryRouter)
app.use('/api/brand',brandRouter)
app.use('/api/coupon',couponRouter)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`)
})