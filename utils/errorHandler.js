const AppError = require('./appError.js');
function errorHandler(err,req,res,next){
   
    console.log(err.message)
    if(!(err instanceof AppError)){
        err= new AppError("Internal Server Error",500,"ServerError")
    }
    
    res.status(err.statusCode).json({
        success:false,
       
        type:err.type,
        message:err.message
        
    });

}
module.exports = errorHandler;