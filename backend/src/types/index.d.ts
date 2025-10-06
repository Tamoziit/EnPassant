import { Types } from "mongoose";
import { Request } from "express";
import { Socket } from "socket.io";

export interface AdminToken {
    password: string
}

export interface UserSignupBody {
    fullName: string;
    username: string;
    email: string;
    password: string;
    gender: "M" | "F" | "O";
    nationality: string;
}

export interface UserLoginBody {
    email: string;
    password: string;
}

export interface GameStats {
    played: number;
    won: number;
    lost: number;
    draw: number;
    stalemate: number;
}

export interface User {
    _id: Types.ObjectId;
    fullName: string;
    username: string;
    email: string;
    password: string;
    profilePic?: string | null;
    gender: "M" | "F" | "O";
    nationality: string;
    elo: number;
    gameStats?: GameStats | null;
}

declare module "express" {
    export interface Request {
        user?: User;
    }
}

export interface PlayerData {
    userId: string;
    username: string;
    elo: number;
    nationality: string;
    color: "w" | "b";
    profilePic?: string | null;
    gender: "M" | "F";
}

export interface RoomData {
    roomId: string;
    player1: PlayerData;
    player2: PlayerData;
    fen: string;
    moves: string[];
    status: "ongoing" | "checkmate" | "draw" | "stalemate";
}

export interface JoinRoomProps {
    userId: Types.ObjectId;
    socket: Socket;
}

export interface HandleMoveProps {
    roomId: string;
    userId: string;
    fen: string;
    move: string;
    socket: Socket;
}

export interface HandleBotMoveProps {
    roomId: string;
    userId: string;
    fen: string;
    moves: string[];
    socket: Socket;
}

export interface BotGameProps {
    userId: Types.ObjectId;
    socket: Socket;
}

export interface BotRoomData {
    roomId: string;
    user: PlayerData;
    fen: string;
    moves: string[];
    status: "ongoing" | "checkmate" | "draw" | "stalemate";
}