import { asyncHandler } from "../utils/asyncHandler.js";
import { User} from  "../models/user.model.js";
import {ApiError} from '../utils/ApiError.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';
import { Mongoose } from "mongoose";

const generateAccessAndRefreshToken=async(Id)=>{
  try {
    const user=await User.findById(Id);
    const refreshToken=user.generateRefreshToken();
    const accessToken=user.generateAccessToken();
    user.refreshToken=refreshToken;
    user.accessToken=accessToken;
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
      // console.log(email,password,userId);

      if(!(userId || email)){
        throw new ApiError(400,"User with this email or userId required");
      };

      //  STEP 2

     const user = await User.findOne({
        $or:[{email},{userId}]
      })

      if(!user){
        throw new ApiError(404,"User does not exist with this email or userId")
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

    const changePassword=asyncHandler(async(req,res)=>{
      const {oldPassword,newPassword,confNewPassword}=res.body

      if(newPassword!==confNewPassword){
        throw new ApiError(400,"Passwords does not match")
      }
      const user= await User.findById(req.user?._id);
      const passwordCheck=user.isPasswordCorrect(oldPassword);

      if(!passwordCheck){
        throw new ApiError(400,"Wrong old password");
      }
      user.password=newPassword;

      await user.save({validateBeforeSave:false});
      res.status(200).json(
        new ApiResponse(200,{},"Password has changed successfully")
      )
    })

    const getCurrentUser=asyncHandler(async(req,res)=>{
      return res.status(200).json(
        new ApiResponse(200,req.user,"Current User fetched successfully")
      )
    })

    const updateUserDetails=asyncHandler(async(req,res)=>{
      const {userId,fullname,email}=req.body;
      if(!(fullname || email|| userId)){
        throw new ApiError(400,"All fields are required")
      }
      const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set:{
            fullname,
            userId,
            email
          }
        },
        {new :true}
      ).select("-password");
      user.save({validateBeforeSave:false})
      res.status(200).json(
        new ApiResponse(200,user,"User details have update successfully")
      )
    })

    const updateCoverImage=asyncHandler(async(req,res)=>{
     const coverImageLocalPath= req.file?.path;
     if(!coverImageLocalPath){
      throw new ApiError(400,"Cover image  file is missing")
     }
     const coverImage=uploadOnCloudinary(coverImageLocalPath);
     if(!coverImage){
      throw new ApiError(400,"Error in uploading  cover image file on cloudinary")
     }
     const user=User.findByIdAndUpdate(
      req.user?._id,
      {
        $set:{
          coverImage:coverImage.url
        }
      }
     ).select("-password")
     return res.status(200).json(
      new ApiResponse(200,user,"Cover image  has update successfully")
     )
    })
    const updateAvatar=asyncHandler(async(req,res)=>{
     const avatarLocalPath= req.file?.path;
     if(!avatarLocalPath){
      throw new ApiError(400,"Avatar file is missing")
     }
     const avatar=uploadOnCloudinary(avatarLocalPath);
     if(!avatar){
      throw new ApiError(400,"Error in uploading avatar file on cloudinary")
     }
     const user=User.findByIdAndUpdate(
      req.user?._id,
      {
        $set:{
          avatar:avatar.url
        }
      }
     ).select("-password")
     return res.status(200).json(
      new ApiResponse(200,user,"Avatar has update successfully")
     )
    })


    const getUserChannelDeatails=asyncHandler(async(req,res)=>{
        const {userId}=req.params;
        if(!userId){
          throw new ApiError(404,"userId is missing")
        }
       const channel= await User.aggregate([
          {
            $match:{
              userId:userId.toLowerCase()
            }
          },
          {
            $lookup:{
              from:"subscriptions",
              localField:"_id",
              foreignField:"channel",
              as:"Subcribers"
            }
          },
          {
          $lookup:{
            from:"subscriptions",
              localField:"_id",
              foreignField:"subcriber",
              as:"SubcriberedTo"
          }
          },
          {
            $addFields:{
              SubscribersCount:{
                $size:"$Subcribers"
              },
              channelSubscribedToCount:{
                $size:"$SubcriberedTo"
              },
             isSubscribedTo: {
                $cond:{
                  $if:{$in:[req.user?._id,"$Subcribers.subcriber"]},
                  then:true,
                  else:false
                }
              }
            }
          },
          {
            $project:{
              fullname:1,
              userId:1,
              email:1,
              avatar:1,
              channelSubscribedToCount:1,
              SubscribersCount:1,
              createAt:1,
            }
          }
        ])
        if(!channel?.length){
          throw new ApiError(404,"channel does not exist")
        }
        console.log(channel);
        res.
        status(200).
        json(
          new ApiResponse(200,channel[0],"channel details fetched successfully")
        )
    })

    const userWatchHistory=asyncHandler(async(req,res)=>{
      const user=User.aggregate([
        {
          $watch:{
            _id:Mongoose.Types.ObjectId(req.user._id)
          }
        },
        {
          $lookup:{
            from:"video",
            localField:"userhistory",
            foreignField:"_id",
            as:"WatchHistory",
            pipeline:([
              {
                $lookup:{
                  from:"User",
                  localField:"creator",
                  foreignField:"_id",
                  as:"creator",
                  pipeline:([
                    {
                      $project:{
                        fullname:1,
                        userId:1,
                        avatar
                      }
                    }
                  ])
                }
              },
              {
                $addFields:{
                  owner:{
                    $first:"$owner"
                  }
                }
              }
            ])
          }
        }
      ])
      res.
      status(200).
      json(
        new ApiResponse(200,user[0].userhistory,"User watch history Successfully")
      )
    })
export {registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateUserDetails,
  updateAvatar,
  getUserChannelDeatails,
  userWatchHistory
};


