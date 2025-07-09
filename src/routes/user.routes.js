<<<<<<< HEAD
import { loginUser, logoutUser, registerUser } from '../controllers/user.controller.js';
import {Router} from 'express';
import {upload} from '../middlewares/multer.middleware.js'
import { varifyJWT } from '../middlewares/auth.middleware.js';
=======
import { registerUser } from '../controllers/user.controller.js';
import {Router} from 'express';
import {upload} from '../middlewares/multer.middleware.js'
>>>>>>> 9828a793bfb6decd0162beb5d8c43d15961a4280

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

<<<<<<< HEAD
    router.route("/login").post(loginUser);

//Secure routes

router.route("/logout").post(varifyJWT,logoutUser);
=======

>>>>>>> 9828a793bfb6decd0162beb5d8c43d15961a4280
export default router;