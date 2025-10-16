import { Request, Response } from "express";
import { Chess } from "chess.js";
import User from "../models/user.model";
import client from "../redis/client";
import { BotGameProps, BotPlayerData, BotResult, BotRoomData, HandleBotMoveProps, ResignProps } from "../types";
import generateRoomId from "../utils/generateRoomId";
import evaluateFEN from "../services/stockfishEval";
import getMaterialInfo from "../utils/materialInfo";
import { bots } from "../data/bots";
import getResult from "../utils/getResult";

export const handlePlayBot = async ({ botObj, userId, socket }: BotGameProps) => {
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
        const bot = {
            ...(botObj),
            color: isUserWhite ? "b" : "w"
        }

        const materialInfo = {
            "capturedByWhite": { "p": 0, "n": 0, "b": 0, "r": 0, "q": 0 },
            "capturedByBlack": { "p": 0, "n": 0, "b": 0, "r": 0, "q": 0 },
            "materialAdvantage": 0
        }

        const botRoom = {
            roomId,
            user: userObj,
            bot,
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            moves: [],
            status: "ongoing",
            materialInfo
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
        for (const m of room.moves) {
            chess.move(m);
        }
        let capturedByWhite, capturedByBlack, materialAdvantage;
        ({ capturedByWhite, capturedByBlack, materialAdvantage } = getMaterialInfo(chess));
        room.materialInfo = {
            capturedByWhite,
            capturedByBlack,
            materialAdvantage
        };

        let isCheck = chess.inCheck();
        let gameEnded = false;
        let message = "";
        let result;

        result = getResult(chess) as BotResult;
        room.status = result.status;
        gameEnded = result.gameEnded;
        message = result.message;

        await client.set(`BOT:${roomId}`, JSON.stringify(room));
        socket.emit("botMaterialInfo", room.materialInfo);

        const gameEval1 = await evaluateFEN(fen);
        socket.emit("botGameEval", gameEval1);

        // User reached a result before bot
        if (gameEnded) {
            const statusPayload = {
                status: room.status,
                message,
                winner: room.status === "checkmate" ? userId : null
            };

            socket.emit("botGameEnd", statusPayload);
            return;
        }

        // Game not ended before bot move
        const bot = bots.find(b => b.id === room.bot.id);
        if (!bot) {
            socket.emit("botNotFound", "Cannot find Bot");
            return;
        }
        const { from, to, promotion } = await bot.moveFunction(fen)

        chess.reset();
        chess.load(fen);
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
        ({ capturedByWhite, capturedByBlack, materialAdvantage } = getMaterialInfo(chess));
        room.materialInfo = {
            capturedByWhite,
            capturedByBlack,
            materialAdvantage
        };

        isCheck = chess.inCheck();
        result = getResult(chess) as BotResult;
        room.status = result.status;
        gameEnded = result.gameEnded;
        message = result.message;

        await client.set(`BOT:${roomId}`, JSON.stringify(room));

        socket.emit("handleBotMove", {
            opponentFen: room.fen,
            moves: room.moves,
            isCheck
        });
        socket.emit("botMaterialInfo", room.materialInfo);

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

export const handleBotGameResign = async ({ roomId, userId, socket }: ResignProps) => {
    try {
        console.log("Inside resignation")
        const data = await client.get(`BOT:${roomId}`);

        if (!data) {
            socket.emit("botRoomNotFound", "Cannot find Room data");
            return;
        }

        const room = JSON.parse(data) as BotRoomData;

        if (room.status !== "ongoing") {
            return;
        }

        room.status = "resignation";
        await client.set(`BOT:${roomId}`, JSON.stringify(room));

        const statusPayload = {
            status: "resignation",
            message: "Won by Resignation",
            winner: room.status === "resignation" ? null : userId
        };

        socket.emit("botGameEnd", statusPayload);
    } catch (error) {
        console.error("Error in handleResign:", error);
        socket.emit("error", "Server error while handling resign.");
    }
}