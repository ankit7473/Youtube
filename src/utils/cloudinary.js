import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

  // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY, 
        api_secret: process.env.API_SECRET
    });

    const uploadOnCloudinary=async (localFilePath)=>{
        try {
            if(!localFilePath) return null

            //upload the file in cloudinary
          const response= await  cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
          })
          // console.log("file is uploaded on cloudinary",response.url);
            fs.unlinkSync(localFilePath);
          return response;
        } catch (error) {
            fs.unlinkSync(localFilePath); // remove the locally saved temp file as the upload operation got failed
            console.log(error);
            return null;
        }
    }
    export {uploadOnCloudinary};