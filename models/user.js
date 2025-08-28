const mongoose= require('mongoose')
const jwt = require("jsonwebtoken");
const bcrypt =require('bcryptjs')

const userSchema= new mongoose.Schema({
    username:{
        type:String,
        required:[true, 'Please Enter your Name']
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,

    },
    password:{
        type:String,
       required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});


// ENCRYPTING PASSWORD using mongoose middleware
// userSchema.pre('save',function(next){
//     if (!this.isModified('password')) return next();
    
//    bcrypt.genSalt(10,(err,salt)=>{
//     if(err) return next(err);
//     bcrypt.hash(this.password,salt,(err,hash)=>{
//         if(err) return next(err);
//         this.password=hash;
//         next()
//     })
//    })
// })


userSchema.pre('save',async function(){
    if(!this.isModified('password')) return;
    const salt= await bcrypt.genSalt(10)
    this.password= await bcrypt.hash(this.password,salt)
})


userSchema.methods.generateJWT= function(){
    return jwt.sign(
        {id:this._id},
        process.env.JWT_SECRET,
        {expiresIn:"5d"}
    )
}


userSchema.methods.comparePassword=async function(inputPassword){
    const isMatch= await bcrypt.compare(inputPassword,this.password);
    return isMatch
}



module.exports= mongoose.model('User',userSchema);