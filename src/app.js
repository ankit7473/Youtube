import express from 'express';
import cors from 'cors';
import {Limits} from './constants.js';
import cookieParser from 'cookie-parser';

let app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credential:true
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

export {app}