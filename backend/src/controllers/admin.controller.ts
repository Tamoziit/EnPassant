import { Request, Response } from "express";
import { AdminToken } from "../types";
import jwt from "jsonwebtoken";

export const getToken = async (req: Request, res: Response) => {
	try {
		const { password }: AdminToken = req.body;
		const adminPassword = process.env.ADMIN_PASSWORD!;

		if (!password || password !== adminPassword) {
			res.status(401).json({ error: "Invalid Admin Credentials" });
			return;
		}

		const payload = {
			adminPassword,
		};

		const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "5h" });
		res.status(200).json(token);
	} catch (error) {
		console.log("Error in getting Admin Token", error);
		res.status(500).json({ error: "Internal Server error" });
	}
}