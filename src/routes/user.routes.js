
import { loginUser, logoutUser, registerUser,refreshAccessToken } from '../controllers/user.controller.js';
import {Router} from 'express';
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js';



const router=Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxcount:2
        },
        {
            name:"coverImage",
            maxcount:2
        }
    ]),registerUser);


    router.route("/login").post(loginUser);

//Secure routes

router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh_token").post(refreshAccessToken);


export default router;