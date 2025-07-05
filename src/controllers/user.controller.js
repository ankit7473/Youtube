import { asynchHandler } from "../utils/asyncHandler.js";

const registerUser=asynchHandler(
  async  (req,res)=>{
        res.status(200).json({
            message:"this is ankit again 2"
        })
    }
)

export {registerUser};