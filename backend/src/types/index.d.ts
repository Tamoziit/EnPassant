import { Types } from "mongoose";
import { Request } from "express";

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