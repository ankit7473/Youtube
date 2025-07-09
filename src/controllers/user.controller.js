import { asyncHandler } from "../utils/asyncHandler.js";
import { User} from  "../models/user.model.js";
import {ApiError} from '../utils/ApiError.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken=async(Id)=>{
  try {
    const user=await User.findById(Id);
    const refreshToken=user.generateRefreshToken();
    const accessToken=user.generateAccessToken();
    user.refreshToken=refreshToken;
    await user.save({validateBeforeSave:false});

    return {refreshToken,accessToken};

  } catch (error) {
    throw new ApiError(505,"Something went wrong while generating the refresh  and access token")
  }
}



const registerUser=asyncHandler(
  async  (req,res)=>{
       // STEPS FOR REGISTERING THE USER 

       // 1. GET USER DETAILS FROM THE FRONT END 
       // 2. VALIDATION -NOT EMPTY
       // 3. CHECK IF USER ALREADY EXIST: THROUGH USERNAME OR EMAIL
       // 4. CHECK FOR IMAGES,CHECK FOR AVATAR
       // 5. UPLOAD THE IMAGES ON CLOUDINARY ,CHECK FOR AVATAR
       // 6. CREATE USER OBJECT FOR MONGODB -CREATE ENRTY IN DB
       // 7. REMOVE THE PASSSWORD,REFRESH TOKEN FILEDS FROM THE USER RESPONSE
       // 8. CHECK FOR USER CREATION 
       // 9. RETURN THE RES 

       // STEP 1 
      const {fullname,email,userId,password}  = req.body



      // STEP 2 
      if(
        [fullname,email,userId,password].some((field)=> field?.trim()==="")
    ){
        throw new ApiError(400,"all fields are required")
      };


      // STEP 3
      const existedUser= await User.findOne({
        $or:[{ email },{ userId }]
      })
      if(existedUser){
        throw new ApiError(409,"User with email or userId already exist")
      }

      // STEP 4
const avatarLocalpath = req.files?.avatar[0]?.path;
const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
     if(!avatarLocalpath){
        throw new ApiError(400,"Avatar is required")
     }

     //STEP 5

     const avatar= await  uploadOnCloudinary(avatarLocalpath);
     const  coverImage= await uploadOnCloudinary(coverImageLocalPath);
    //  console.log(avatar);
    //  console.log(coverImage)

     if(!avatar){
        throw new ApiError(400,"Avatar image is required")
     }

     // STEP 6

    const user=await User.create({
        fullname,
        avatar:avatar.url,
        password,
        email,
        userId:userId.toLowerCase(),
        coveImage:coverImage?.url||"",
     })
// 
     // STEP 7
   const createdUser= await User.findById(user._id).select(
    "-password -refreshToken"
   );

   if(!createdUser){
    throw new ApiError(500,"something went wrong while registering the user")
   };

   console.log("User has registered successfully");
   // STEP 8 
   return res.status(200).json(
    new ApiResponse(200,createdUser,"User registered successfully")
   );
    })

    const loginUser=asyncHandler(async(req,res)=>{
      

      // STEPS FOR LOGIN USER

      // STEP 1. GET THE USER DETAILS FROM THE RES.BODY
      // STEP 2. FIND THE USER
      // STEP 3. CHECK THE PASSWORD 
      // STEP 4. ACCESS AND REFRESH TOKEN SEND TO THE USER
      // STEP 5. SEND THE COOKIES 
      // STEP 6. SEND THE RESPONSE

      // STEP 1 
      const {userId,password,email}=req.body;
      console.log(email,password,userId);

      if(!(userId || email)){
        throw new ApiError(400,"User with this email or userId required");
      };

      //  STEP 2

     const user = await User.findOne({
        $or:[{email},{userId}]
      })

      if(!user){
        throw new ApiError(404,"User does not exist")
      }

      // STEP 3

     const isPasswordValid= await user.isPasswordCorrect(password);
     if(!isPasswordValid){
      throw new ApiError(404,"Wrong password entered")
     }

    //  STEP 4

      const{refreshToken,accessToken}=await generateAccessAndRefreshToken(user._id);

      const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

      // STEP 5
      const options ={
        httpOnly:true,
        secure:true
      }

      return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
        new ApiResponse(200,
          {
          user:loggedInUser,accessToken,refreshToken
        },
          "User logged in Successfully"
      )
      )

    })

    const logoutUser=asyncHandler(async(req,res)=>{
        await  User.findByIdAndUpdate(
          req.user._id,
          {
            $set:{
              refreshToken:undefined
            }
          },
          {
            new:true
          }
        )

         const options ={
        httpOnly:true,
        secure:true
      }

      res
      .status(200)
      .clearCookie("refreshToken",options)
      .clearCookie("accessToken",options)
      .json(new ApiResponse(200,{},"User logged Out"))
    })

    const refreshAccessToken=asyncHandler(async(req,res)=>{
     const encodedIncomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken;
     if(!encodedIncomingRefreshToken){
      throw new ApiError(400,"unauthorize refresh token");
     }

     const decodedIncomingRefreshToken=jwt.verify(encodedIncomingRefreshToken,REFRESH_TOKEN_SECRET
     )

    const user=User.findById(decodedIncomingRefreshToken?._id);
     if(!user){
      throw new ApiError(404,"unauthorize refresh token");
     }

     if(encodedIncomingRefreshToken!==user?.refreshToken){
      throw new ApiError(400,"refresh token is expired or used");
     }

    const  options={
      httpOnly:true,
      secure:true
     }

     const {newRefreshToken,accessToken}= await generateAccessAndRefreshToken(user._id);


     res.
     status(200).
     cookie("refreshToken",newRefreshToken,options).
     cookie("accessToken",accessToken,options).
     json(200,{
          accessToken,refreshToken:newRefreshToken
     }," new refreshToken and accessToken have generated"
    )
    })

export {registerUser,loginUser,logoutUser,refreshAccessToken};


