import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

  // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY, 
        api_secret: CLOUDINARY_API_SECRET
    });

    const uploadOnCloudinary=async (localFilePath)=>{
        try {
            if(!localFilePath) return null

            //upload the file in cloudinary
          const response= await  cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto";
          })
          console.log("file is uploaded on cloudinary",response.url);
          return response;
        } catch (error) {
            fs.unlinkSync(localFilePath); // remove the locally saved temp file as the upload operation got failed
            console.log(error);
            return null;
        }
    }
    export {uploadOnCloudinary};