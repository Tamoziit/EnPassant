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
    mobileNo: string;
    gender: "M" | "F" | "O";
}

export interface UserLoginBody {
    email: string;
    password: string;
}

export interface User {
    _id: Types.ObjectId;
    fullName: string;
    username: string;
    email: string;
    password: string;
    mobileNo: string;
    profilePic?: string | null;
    gender: "M" | "F" | "O";
}

declare module "express" {
    export interface Request {
        user?: User;
    }
}