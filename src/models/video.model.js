import mongoose ,{Schema} from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
let videoSchema=new Schema(
    {
        video:{
            type:String, // from the cloudinary
            required:true
        },
        thumbnail:{
            type:String, // from the cloudinary
            required:true
        },
        title:{
            type:String, 
            required:true
        },
        description:{
            type:String, 
            required:true
        },
        duration:{
            type:Number, // from the cloudinary
            defualt:0
        },
        views:{
            type:Number,
            default:0
        },
        idPublished:{
            type:Boolean,
            default:true
        },
        creator:{
            type:Schema.Types.ObjectId;
            ref:"User"
        }
}
,{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate);

export const Video=mongoose.model("Video",videoSchema);