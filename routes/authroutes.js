const express=require('express');
const { createUser, loginUserctrl,
     getallUser,  deleteaUser, updateaUser,
      getaUser, blockUser, unblockUser,
       handlerefreshtoken, logout ,updatePassword,forgotPasswordToken,resetPassword,
       loginAdmin,
       getWishlist,
       saveAddress,
       userCart,
       getUserCart,
       emptyCart,
       applyCoupon,
       createOrder,
       getOrders,
       updateOrderStatus} = require('../controllers/UserCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router=express.Router();

router.post('/register',createUser)
router.delete('/empty-cart',authMiddleware,emptyCart)
router.post('/forgot-password-token',forgotPasswordToken)
router.put('/reset-password/:token',resetPassword)
router.put('/password',authMiddleware,updatePassword)
router.post('/login',loginUserctrl)
router.post('/admin-login',loginAdmin)
router.post('/cart',authMiddleware,userCart)
router.post('/cart/applycoupon',authMiddleware,applyCoupon)
router.post('/cart/cash-order',authMiddleware,createOrder)
router.get("/all-users",getallUser)
router.get("/get-orders",authMiddleware,getOrders)
router.put("/order/update-order/:id",authMiddleware,isAdmin,updateOrderStatus)
router.get('/logout',logout)
router.get("/refresh",handlerefreshtoken)
router.get('/wichlist',authMiddleware,getWishlist)
router.get('/cart',authMiddleware,getUserCart)
router.get('/:id',authMiddleware,isAdmin,getaUser)
router.delete("/:id",deleteaUser);
router.get('/cart',authMiddleware,getUserCart)
router.put("/edit-user",authMiddleware,updateaUser);
router.put("/save-address",authMiddleware,saveAddress);
router.put("/block-user/:id",authMiddleware,isAdmin,blockUser)
router.put("/unblock-user/:id",authMiddleware,isAdmin,unblockUser)


module.exports=router;



