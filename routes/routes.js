const express= require('express');
const router= express.Router();
const {registerUser,login}=require('../controller/userController.js');
const auth=require('../middleware/auth.js')

router.post('/register',registerUser);
router.post('/login',login)

router.get('/verify-token',auth,(req,res)=>{
    res.status(200).json({valid:true,user:req.user})
})

module.exports=router
