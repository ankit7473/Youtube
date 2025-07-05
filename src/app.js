import express from 'express';
import cors from 'cors';
import {Limits} from './constants.js';
import cookieParser from 'cookie-parser';

let app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));

app.use(express.json({
   limit:Limits.json
}));

app.use(express.urlencoded(
    {
        limit:Limits.json
    }
));

app.use(express.static("public"));

app.use(cookieParser());


// routes import 

import router from './routes/user.routes.js';

// routes declaration

app.use("/api/v1/users",router)

// URL = http://localhost:5000/api/v1/users/register

export {app}