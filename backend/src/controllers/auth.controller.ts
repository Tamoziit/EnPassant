import { Request, Response } from "express";
import { UserLoginBody, UserSignupBody } from "../types";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import client from "../redis/client";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie";

export const signup = async (req: Request, res: Response) => {
	try {
		const {
			fullName,
			username,
			email,
			password,
			gender,
			nationality
		}: UserSignupBody = req.body;

		if (password.length < 6) {
			res.status(400).json({ error: "Password should be at least 6 characters long" });
			return;
		}
		if (username.length < 2) {
			res.status(400).json({ error: "Name should be at least 2 characters long" });
			return;
		}
		if (gender !== "M" && gender !== "F" && gender !== "O") {
			res.status(400).json({ error: "Enter a gender" });
			return;
		}

		const sameUser = await User.findOne({ email });
		if (sameUser) {
			res.status(400).json({ error: "A user with this Email. already exists. Use another Email, or try logging into your account." });
			return;
		}

		const sameUserName = await User.findOne({ username });
		if (sameUserName) {
			res.status(400).json({ error: "This username already exists" });
			return;
		}

		const salt = await bcrypt.genSalt(12);
		const passwordHash = await bcrypt.hash(password, salt);

		const newUser = new User({
			fullName,
			username,
			email,
			password: passwordHash,
			gender,
			nationality
		});

		if (newUser) {
			await newUser.save();

			const token = generateTokenAndSetCookie(newUser._id, res);
			const payload = {
				token,
				_id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				email: newUser.email,
				gender: newUser.gender,
				nationality: newUser.nationality
			}

			await client.set(`EP-user:${newUser._id}`, JSON.stringify(payload));
			await client.expire(`EP-user:${newUser._id}`, 30 * 24 * 60 * 60);

			res.status(201)
				.header("Authorization", `Bearer ${token}`)
				.json({
					_id: newUser._id,
					fullName: newUser.fullName,
					username: newUser.username,
					email: newUser.email,
					gender: newUser.gender,
					profilePic: newUser.profilePic,
					nationality: newUser.nationality,
					token
				});
		}
	} catch (error) {
		console.log("Error in Signup controller", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
}

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password }: UserLoginBody = req.body;
		const user = await User.findOne({ email });
		if (!user) {
			res.status(400).json({ error: "Cannot find User" });
			return;
		}

		const isPasswordCorrect = await bcrypt.compare(password, user.password || "");
		if (!isPasswordCorrect) {
			res.status(400).json({ error: "Invalid Login Credentials" });
			return;
		}

		res.cookie("EP-jwt", "", { maxAge: 0 });
		const token = generateTokenAndSetCookie(user._id, res);
		const payload = {
			token,
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			gender: user.gender,
			nationality: user.nationality
		}

		await client.set(`EP-user:${user._id}`, JSON.stringify(payload));
		await client.expire(`EP-user:${user._id}`, 30 * 24 * 60 * 60);

		res.status(201)
			.header("Authorization", `Bearer ${token}`)
			.json({
				_id: user._id,
				fullName: user.fullName,
				username: user.username,
				email: user.email,
				gender: user.gender,
				profilePic: user.profilePic,
				nationality: user.nationality,
				token
			});
	} catch (error) {
		console.log("Error in Login controller", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
}

export const logout = async (req: Request, res: Response) => {
	try {
		const userId = req.params.id;

		res.cookie("EP-jwt", "", { maxAge: 0 });
		await client.del(`EP-user:${userId}`);

		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in Logout controller", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
}