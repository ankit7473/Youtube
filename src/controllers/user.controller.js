import { asyncHandler } from "../utils/asyncHandler.js";
import { User} from  "../models/user.model.js";
import {ApiError} from '../utils/ApiError.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import { ApiResponse } from "../utils/ApiResponse.js";


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

  //    // STEP 7
  //  const createdUser= await User.findById(user._id).select(
  //   "-password -refreshToken"
  //  );

  //  if(!createdUser){
  //   throw new ApiError(500,"something went wrong while registering the user")
  //  };

  //  // STEP 8 
  //  return res.status(200).json(
  //   new ApiResponse(200,createdUser,"User registered successfully")
  //  );
   

    })

export {registerUser};