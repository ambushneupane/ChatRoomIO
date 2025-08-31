const jwt= require('jsonwebtoken');
const AppError=require('../utils/appError');


module.exports= function (req,res,next){
    const authHeader= req.headers.authorization;
    if(!authHeader|| !authHeader.startsWith('Bearer ')){
        return next(new AppError('Not authorized.Please Login',401,"AuthError"))
    }
    const token= authHeader.split(" ")[1];
    
    try{
        const decoded= jwt.verify(token,process.env.JWT_SECRET)
        req.user= decoded;
        next();
    }catch(err){
        return next(new AppError('Invalid or expired token.Please Log in',401,"AuthError"))
    }
}
