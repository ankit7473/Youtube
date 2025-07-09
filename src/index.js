
import { app } from './app.js';
import connectDB from './db/index.js';
connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.log("Error in Express app:", err);
      process.exit(1); // Force restart
    });

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed!", err);
    process.exit(1); // Force restart
  });

 










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