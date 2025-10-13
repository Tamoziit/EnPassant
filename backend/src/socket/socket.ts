import { Server } from "socket.io";
import http from "http";
import express from "express";
import client from "../redis/client";
import { cancelSearch, cleanupStates, handleMove, joinRoom } from "../controllers/game.controller";
import User from "../models/user.model";
import { handleBotMove, handlePlayBot } from "../controllers/botGame.controller";

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

    socket.on("joinRoom", (data) => {
        console.log(`User ${data.userId} requesting to join game room`);
        joinRoom({
            userId: data.userId,
            timeControls: data.timeControls,
            mode: data.mode,
            socket: socket
        });
    });

    socket.on("cancelSearch", (data) => {
        cancelSearch(data.userId)
    });

    socket.on("handleMove", (data) => {
        handleMove({
            roomId: data.roomId,
            userId: data.userId,
            fen: data.fen,
            move: data.move,
            socket: socket
        });
    });

    socket.on("playBot", (data) => {
        handlePlayBot({
            botObj: data.botObj,
            userId: data.userId,
            socket: socket
        });
    });

    socket.on("handlePlayerMove", (data) => {
        handleBotMove({
            roomId: data.roomId,
            userId: data.userId,
            fen: data.fen,
            moves: data.moves,
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