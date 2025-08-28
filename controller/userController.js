const User= require('../models/user.js')
const AppError=require('../utils/appError.js')
const asyncWrapper=require('../middleware/asyncHandler.js')


exports.registerUser=asyncWrapper(async(req,res,next)=>{   
    const {username,email,password}=req.body||{};
   if(!username|| !email || !password){
    throw new AppError("Missing fields", 400, "ValidationError");
   }

   const existing = await User.findOne({email})
   if(existing){
    throw new AppError('User Already Exists with this email',400,"ValidationError");

   }
   const user=await User.create({username,email,password})
   
   res.status(201).json({
    success:true,
    data:{
        id:user._id,
        username:user.username,
        email:user.email

    }
   })
})

exports.login= asyncWrapper(async(req,res,next)=>{
   const {email,password}=req.body || {};
   
   if(!email || !password){
    throw new AppError('Must Provide Email and password',400,'ValidationError')

   }
   const user= await User.findOne({email});
   if(!user) throw new AppError('Invalid Creds, Please try again',401,'ValidationError')

    const isMatch= await user.comparePassword(password);
    if(!isMatch) throw new AppError('Invalid Creds, Please try again',401,'ValidataionError')
    
    const token= user.generateJWT();
    res.status(200).json({
        msg:'Login Successful',
        token
    })
})
