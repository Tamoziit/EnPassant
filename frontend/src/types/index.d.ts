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
}

export interface RoomData {
    roomId: string;
    player1: PlayerData;
    player2: PlayerData;
    fen: string;
    moves: string[];
    status: string;
}

export interface MoveProps {
    opponentFen: string;
    moves: string[];
    isCheck: boolean;
}

export interface ChessBoardProps {
    roomData: RoomData;
    setRoomData: React.Dispatch<React.SetStateAction<RoomData | null>>;
    moves: string[];
    setMoves: React.Dispatch<React.SetStateAction<string[]>>;
    socket: Socket;
    authUser: AuthUser;
}

export interface ResultProps {
    status: "checkmate" | "draw" | "stalemate";
    winner: string | null;
}

export interface EvalBarProps {
    evalScore: number | string;
    colour: "w" | "b";
};