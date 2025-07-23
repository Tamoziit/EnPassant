import { Server } from "socket.io";
import http from "http";
import express from "express";
import client from "../redis/client";
import { cleanupStates, joinRoom } from "../controllers/game.controller";
import User from "../models/user.model";

const baseUrl = process.env.BASE_URL!;
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [baseUrl],
        methods: [
            "GET",
            "POST",
            "PATCH",
            "DELETE"
        ]
    }
});

io.on("connection", async (socket) => {
    let userId = socket.handshake.query.userId;
    if (Array.isArray(userId)) {
        userId = userId[0];
    }

    if (userId) {
        await client.hset("player_sockets", userId, socket.id);
        console.log(`User ${userId} connected with socket ID ${socket.id}`);
        socket.join(userId);
    }

    // Handle joining game room (matchmaking)
    socket.on("joinRoom", (data) => {
        console.log(`User ${data.userId} requesting to join game room`);
        joinRoom({
            userId: data.userId,
            socket: socket
        });
    });

    socket.on("disconnect", async () => {
        if (userId) {
            console.log(`User ${userId} disconnected`);
            await client.hdel("player_sockets", userId);

            const user = await User.findById(userId);
            if (user) {
                cleanupStates(user._id);
            }
        }
    });
});

export { app, io, server };