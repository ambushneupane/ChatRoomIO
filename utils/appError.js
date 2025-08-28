class AppError extends Error{
    constructor(message,statusCode=500,type="Application Error"){
        super(message);
        this.statusCode=statusCode;
        this.type=type;
    }
}

module.exports=AppError;