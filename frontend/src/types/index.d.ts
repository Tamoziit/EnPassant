import type React from "react";
import type { Socket } from "socket.io-client";

export interface SignupParams {
    fullName: string;
    username: string;
    email: string;
    password: string;
    gender: string;
    nationality: string;
}

export interface LoginParams {
    email: string;
    password: string;
}

export interface AuthUser {
    _id: string;
    fullName: string;
    username: string;
    email: string;
    gender: "M" | "F" | "O";
    profilePic?: string | null;
    nationality: string;
}

export interface AuthContextType {
    authUser: AuthUser | null;
    setAuthUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
}

export interface AuthContextProviderProps {
    children: ReactNode;
}

export interface SocketContextType {
    socket: Socket | null;
    onlinePlayers: string[];
}

export interface SocketProviderProps {
    children: ReactNode;
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
}

export interface RoomData {
    roomId: string;
    player1: PlayerData;
    player2: PlayerData;
    fen: string;
    moves: string[];
    status: "ongoing" | "checkmate" | "draw" | "stalemate" | "timeout";
    timeControl: {
        initial: number;
        increment: number;
    };
    lastMoveTimestamp: number;
}

export interface MoveProps {
    opponentFen: string;
    moves: string[];
    isCheck: boolean;
    playerTimes: {
        [userId: string]: number;
    };
    lastMoveTimestamp: number;
}

export interface ChessBoardProps {
    roomData: RoomData;
    setRoomData: React.Dispatch<React.SetStateAction<RoomData | null>>;
    moves: string[];
    setMoves: React.Dispatch<React.SetStateAction<string[]>>;
    socket: Socket;
    authUser: AuthUser;
}

export interface BotChessBoardProps {
    botRoomData: BotRoomData;
    moves: string[];
    setMoves: React.Dispatch<React.SetStateAction<string[]>>;
    colour: "w" | "b";
    socket: Socket;
    authUser: AuthUser;
}

export interface ResultProps {
    status: "checkmate" | "draw" | "stalemate" | "timeout" | null;
    winner: string | null;
    message: string;
}

export interface Eval {
    score: number | string;
    turn: 'w' | 'b';
}

export interface EvalBarProps {
    evalScore: number | string;
    turn: 'w' | 'b';
    colour: "w" | "b";
};

export interface ResultModalProps {
    roomData: RoomData;
    status: "checkmate" | "draw" | "stalemate" | "timeout" | null;
    winner: string | null;
    message: string;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface GameStats {
    played: number;
    won: number;
    lost: number;
    draw: number;
    stalemate: number;
}

export interface RecordProps {
    elo: number;
    gameStats: GameStats;
    createdAt: string;
}

export interface CloudinarySignature {
    timestamp: number;
    signature: string;
    api_key: string;
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
    user: BotPlayerData;
    fen: string;
    moves: string[];
    status: "ongoing" | "checkmate" | "draw" | "stalemate";
}

interface BotResultModalProps {
    botRoomData: BotRoomData;
    status: "checkmate" | "draw" | "stalemate" | null;
    winner: string | null;
    message?: string;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface TimerProps {
    initialTime: number;
    isActive: boolean;
    serverTime?: number;
    lastMoveTimestamp?: number;
    status: "checkmate" | "draw" | "stalemate" | "timeout" | null;
}
