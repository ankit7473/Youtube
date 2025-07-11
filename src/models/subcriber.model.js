import mongoose, { Schema } from 'mongoose';
const SubscriptionSchema = new Schema({
    subcriber:{
        type:Schema.Types.ObjectId,
        ref:'User',
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:'Channel',
    },
},{timestamps:true});

export const Subscription = mongoose.model('Subscription', SubscriptionSchema);