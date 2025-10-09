import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

import { app, server } from './socket/socket';
import connecToMongoDB from './db/connectToMongoDB';
import client from './redis/client';
import adminRoutes from './routes/admin.routes';
import authRoutes from './routes/auth.routes';
import profileRoutes from "./routes/profile.routes";
import gameRoutes from "./routes/game.routes";
import startTimeoutChecker from './utils/timeoutChecker';

const PORT = process.env.PORT || 3000;

const corsOpts = {
    origin: '*',
    methods: [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'PATCH',
        'OPTIONS'
    ],
    allowHeaders: [
        'Content-Type',
        'Authorization',
        'Accept'
    ],
    credentials: true
};

app.use(cors(corsOpts));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/v1', (req: Request, res: Response) => {
    res.send('Server Up & Running!');
});

app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/game', gameRoutes);

startTimeoutChecker();
console.log("✅ Server-side timeout checker is running");

server.listen(PORT, () => {
    console.log(`🚀 Server is running on PORT: ${PORT}`);
    connecToMongoDB();

    if (client) {
        console.log("📦 Connected to Redis");
    } else {
        console.log("❌ Error in connecting to Redis");
    }
});