import dotenv from "dotenv";
import connectDB from './db/index.js'
dotenv.config({
    path:'./.env'
})



connectDB()
.then(()=>{
        app.on("error",(err)=>{
            console.log("Error in listening the app",err);
            throw err;
        });

    app.listen(process.env.PORT || 5000,()=>{
        console.log(`server is running at port ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGODB connection failed !!!",err);
})












// FIRST APPROACH


// import express from 'express'
// const app=express();
// ;(async()=>{
//     try {
//       await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
        
//       app.on("error",(error)=>{
//         console.log("ERRR",error);
//         throw error;
//       })
//       app.listen(process.env.PORT,()=>{
//         console.log(`App is listening on port ${process.env.PORT}`);
//       })
//     } catch (error) {
//         console.log("Error" + error)
//     }
// })()