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

interface SearchState {
    searchActive: boolean;
    timeoutId: NodeJS.Timeout | null;
    mode: "Rapid" | "Blitz" | "Bullet";
}

export interface PlayerData {
    userId: string;
    username: string;
    elo: number;
    nationality: string;
    color: "w" | "b";
    profilePic?: string | null;
    gender: "M" | "F";
    timeRemaining: number;
    mode: "Rapid" | "Blitz" | "Bullet";
}

export interface MaterialInfo {
    capturedByWhite: {
        p: number;
        n: number;
        b: number;
        r: number;
        q: number;
    };
    capturedByBlack: {
        p: number;
        n: number;
        b: number;
        r: number;
        q: number;
    };
    materialAdvantage: number;
}

export interface RoomData {
    roomId: string;
    player1: PlayerData;
    player2: PlayerData;
    fen: string;
    moves: string[];
    status: "ongoing" | "checkmate" | "draw" | "stalemate" | "timeout" | "resignation";
    timeControl: {
        initial: number;
        increment: number;
    };
    lastMoveTimestamp: number;
    materialInfo: MaterialInfo;
    mode: "Rapid" | "Blitz" | "Bullet";
}

export interface JoinRoomProps {
    userId: Types.ObjectId;
    timeControls: {
        initial: number;
        increment: number;
    };
    mode: "Rapid" | "Blitz" | "Bullet";
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

export interface Bot {
    id: string;
    name: string;
    elo: number;
    image: string;
}

export interface BotGameProps {
    botObj: Bot;
    userId: Types.ObjectId;
    socket: Socket;
}

export interface BotData {
    id: string;
    name: string;
    elo: number;
    image: string;
    color: "w" | "b";
}

export interface BotPlayerData {
    userId: string;
    username: string;
    elo: number;
    nationality: string;
    color: "w" | "b";
    profilePic?: string | null;
    gender: "M" | "F";
}

export interface BotRoomData {
    roomId: string;
    bot: BotData;
    user: BotPlayerData;
    fen: string;
    moves: string[];
    status: "ongoing" | "checkmate" | "draw" | "stalemate" | "resignation";
    materialInfo: MaterialInfo
}

export interface BotResult {
    status: "ongoing" | "checkmate" | "draw" | "stalemate" | "resignation";
    gameEnded: boolean;
    message: string;
}

export interface ResignProps {
    roomId: string;
    userId: string;
    socket: Socket;
}

export interface DrawProps {
    roomId: string;
    userId: string;
    socket: Socket;
}

export interface DrawResolutionProps {
    roomId: string;
    userId: string;
    accepted: boolean;
    socket: Socket;
}