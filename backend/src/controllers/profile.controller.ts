import { Request, Response } from "express";
import User from "../models/user.model";

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findByIdAndUpdate(req.user?._id, req.body, {
            new: true,
            runValidators: true
        }).select("-password");

        if (user) {
            res.status(200).json({
                _id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                gender: user.gender,
                profilePic: user.profilePic,
                nationality: user.nationality,
                elo: user.elo,
                gameStats: user.gameStats,
                token: req.headers.authorization?.split(" ")[1]
            });
        } else {
            res.status(400).json({ error: "Couldn't Update your Profile" });
            return;
        }
    } catch (error) {
        console.log("Error in updateProfile controller", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getElo = async (req: Request, res: Response) => {
    try {
        const id = req.user?._id;
        const user = await User.findById(id);

        if (!user) {
            res.status(400).json({ error: "Cannot find User" });
            return;
        }

        res.status(200).json(user.elo);
    } catch (error) {
        console.log("Error in getElo controller", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getRecords = async (req: Request, res: Response) => {
    try {
        const id = req.user?._id;
        const user = await User.findById(id);

        if (!user) {
            res.status(400).json({ error: "Cannot find User" });
            return;
        }

        res.status(200).json({
            elo: user.elo,
            gameStats: user.gameStats,
            createdAt: user.createdAt
        });
    } catch (error) {
        console.log("Error in getRecords controller", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}