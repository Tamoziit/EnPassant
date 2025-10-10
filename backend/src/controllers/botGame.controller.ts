import { Request, Response } from "express";
import { Chess } from "chess.js";
import User from "../models/user.model";
import client from "../redis/client";
import { BotGameProps, BotPlayerData, BotRoomData, HandleBotMoveProps } from "../types";
import generateRoomId from "../utils/generateRoomId";
import evaluateFEN from "../services/stockfishEval";
import getBestMove from "../services/getBestMove";

export const handlePlayBot = async ({ userId, socket }: BotGameProps) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            socket.emit("error", "User not found");
            return;
        }

        const roomId = `BM-${generateRoomId()}`;
        const isUserWhite = Math.random() < 0.5;

        const userObj = {
            userId: user._id.toString(),
            username: user.username,
            elo: user.elo,
            nationality: user.nationality,
            profilePic: user.profilePic,
            gender: user.gender,
            color: isUserWhite ? "w" : "b",
        } as BotPlayerData;

        const botRoom = {
            roomId,
            user: userObj,
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            moves: [],
            status: "ongoing"
        } as BotRoomData

        await client.set(`BOT:${roomId}`, JSON.stringify(botRoom));
        await client.expire(`BOT:${roomId}`, 86400);

        socket.emit("startGame", botRoom.roomId);
    } catch (error) {
        console.error("Error in handlePlayBot:", error);
        socket.emit("error", "Server error while starting a Bot Game");
    }
}

export const handleBotMove = async ({ roomId, userId, fen, moves, socket }: HandleBotMoveProps) => {
    try {
        const data = await client.get(`BOT:${roomId}`);

        if (!data) {
            socket.emit("botRoomNotFound", "Cannot find Bot Room data");
            return;
        }

        const room = JSON.parse(data) as BotRoomData;

        const currentTurn = fen.split(" ")[1];
        if (currentTurn === room.user.color) {
            socket.emit("notYourTurn", "Not your turn.");
            return;
        }

        room.moves = moves;
        const chess = new Chess();
        chess.load(fen);
        const gameEval1 = await evaluateFEN(fen);

        socket.emit("botGameEval", gameEval1);

        const { from, to, promotion } = await getBestMove(fen);

        let move;
        if (promotion) {
            move = chess.move({
                from: from,
                to: to,
                promotion: promotion.toLowerCase()
            });
        } else {
            move = chess.move({
                from: from,
                to: to
            });
        }

        if (!move) {
            socket.emit("InvalidMove", "Error in parsing Bot move");
            return;
        }

        const moveNotation = move.san;
        room.fen = chess.fen();
        room.moves.push(moveNotation);

        chess.reset();
        for (const m of room.moves) {
            chess.move(m);
        }

        const isCheck = chess.inCheck();
        let gameEnded = false;
        let message = "";

        if (chess.isCheckmate()) {
            room.status = "checkmate";
            gameEnded = true;
        } else if (chess.isStalemate()) {
            room.status = "stalemate";
            gameEnded = true;
        } else if (chess.isThreefoldRepetition()) {
            room.status = "draw";
            message = "by 3-fold move repetition"
            gameEnded = true;
        } else if (chess.isDrawByFiftyMoves()) {
            room.status = "draw";
            message = "by 50 move rule"
            gameEnded = true;
        } else if (chess.isInsufficientMaterial()) {
            room.status = "draw";
            message = "by insufficient Checkmating material"
            gameEnded = true;
        } else {
            room.status = "ongoing";
        }

        await client.set(`BOT:${roomId}`, JSON.stringify(room));

        socket.emit("handleBotMove", {
            opponentFen: room.fen,
            moves: room.moves,
            isCheck
        });

        if (gameEnded) {
            const statusPayload = {
                status: room.status,
                message,
                winner: room.status === "checkmate" ? null : userId
            };

            socket.emit("botGameEnd", statusPayload);
        }

        const gameEval2 = await evaluateFEN(room.fen);

        socket.emit("botGameEval", gameEval2);
    } catch (error) {
        console.error("Error in handleBotPlay:", error);
        socket.emit("error", "Server error while handling bot move.");
    }
}

export const getBotRoomData = async (req: Request, res: Response) => {
    try {
        const roomId = req.params.roomId;
        const data = await client.get(`BOT:${roomId}`);

        if (data) {
            const room = JSON.parse(data);
            res.status(200).json(room);
        } else {
            res.status(400).json({ error: "Cannot find Bot Room data" });
        }
    } catch (error) {
        console.log("Error in getBotRoomData controller", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}