import { registerUser } from '../controllers/user.controller.js';
import {Router} from 'express';
import {upload} from '../middlewares/multer.middleware.js'

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


export default router;