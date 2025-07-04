import express from 'express';
import { Limits } from '../constants.js';
import cors from 'cors';
import cookieParser from 'cookie-parsesr'

const app=express();

app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }
))

app.use(express.json(
    {
        limit:Limits.json
    }
))

app.use(express.urlencoded({
    limit:Limits.json,
    extended:true
}))
app.use(express.static("public"))

app.use(cookieParser())

export { app }
