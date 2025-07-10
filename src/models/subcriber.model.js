import mongoose, { Schema } from 'mongoose';
const subscriberSchema = new Schema({
    subcriber:{
        type:Schema.Types.ObjectId,
        ref:'User',
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:'Channel',
    },
},{timestamps:true});

export const Subscriber = mongoose.model('Subscriber', subscriberSchema);