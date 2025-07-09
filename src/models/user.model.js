
import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
let userSchema = new Schema(
  {
    userId:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
       
    },
    fullname:{
        type:String,
        required:true,
        index:true
    },
    avatar:{
        type:String, // cloudinary 
        required:true
    },
    coverImage:{
        type:String, // cloudinary 
    },
    password:{
        type:String,
        raquired:[true,'Password is required']
    },
    refreshToken:{
        type:String,
        requried:true
    },
    userhistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ]
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,10);
    next();
} )
<<<<<<< HEAD


userSchema.methods.isposswordcorrect=async function (password) {
     return await bcrypt.compare("password",this.password);
}



=======
userSchema.methods.isposswordcorrect=async function (password) {
     return await bcrypt.compare("password",this.password);
}
>>>>>>> 9828a793bfb6decd0162beb5d8c43d15961a4280
userSchema.methods.generatRefreshToken=function (){
    jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.userId,
            fullname:this.fullname
        },
        process.env.ACCESSS_TOKEN_SECRET,
        {
           expiresIn: process.env.ACCESSS_TOKEN_EXPIRY
        }
    )
}
<<<<<<< HEAD
userSchema.methods.generatAccessToken=function (){
=======
userSchema.methods.generatRefreshToken=function (){
>>>>>>> 9828a793bfb6decd0162beb5d8c43d15961a4280
    jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
           expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", userSchema);
