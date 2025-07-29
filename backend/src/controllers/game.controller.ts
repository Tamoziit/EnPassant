import { Types } from "mongoose";
import User from "../models/user.model";
import client from "../redis/client";
import { io } from "../socket/socket";
import { HandleMoveProps, JoinRoomProps, RoomData } from "../types";
import { Request, Response } from "express";
import generateRoomId from "../utils/generateRoomId";
import chess from "../services/chessEngine";
import evaluateFEN from "../services/stockfishEval";

const MAX_ELO_DIFF = 100;
const MAX_WAIT_TIME_MS = 30000;

interface SearchState {
	searchActive: boolean;
	timeoutId: NodeJS.Timeout | null;
}

const activeSearches = new Map<Types.ObjectId, SearchState>();

export const joinRoom = async ({ userId, socket }: JoinRoomProps) => {
	try {
		console.log("Searching for match...");

		const user = await User.findById(userId);
		if (!user) return socket.emit("error", "User not found");

		const userObj = {
			userId: user._id.toString(),
			username: user.username,
			elo: user.elo,
			nationality: user.nationality,
			profilePic: user.profilePic,
			gender: user.gender
		};

		const userKey = JSON.stringify(userObj);

		// Checking if user is already searching
		if (activeSearches.has(userId)) {
			return socket.emit("error", "Already searching for a match");
		}

		const existingUser = await client.zscore("REDIS_MATCH_SET", userKey);
		if (existingUser !== null) {
			return socket.emit("error", "Already searching for a match");
		}

		// Adding user to Redis sorted set
		await client.zadd("REDIS_MATCH_SET", user.elo, userKey);

		const members = await client.zrange("REDIS_MATCH_SET", 0, -1, "WITHSCORES");
		console.log("Current Redis Match Set members:", members.length / 2);

		// Initializing search state
		const searchState = { searchActive: true, timeoutId: null };
		activeSearches.set(userId, searchState);

		const startTime = Date.now();

		const tryFindMatch = async (): Promise<void> => {
			try {
				// Checking if this user's search is still active
				let searchState = activeSearches.get(userId);
				if (!searchState || !searchState.searchActive) {
					return; // Search was cancelled or completed
				}

				const minElo = user.elo - MAX_ELO_DIFF;
				const maxElo = user.elo + MAX_ELO_DIFF;

				const candidates = await client.zrangebyscore("REDIS_MATCH_SET", minElo, maxElo);

				for (const candidateStr of candidates) {
					// Re-checking search state before processing each candidate
					searchState = activeSearches.get(userId);
					if (!searchState || !searchState.searchActive) {
						return;
					}

					const candidate = JSON.parse(candidateStr);
					if (candidate.userId === userObj.userId) continue; // skip self

					// Getting candidate's socket ID from Redis
					const candidateSocketId = await client.hget("player_sockets", candidate.userId);

					if (!candidateSocketId) {
						// Candidate is offline, removing them and continue searching
						await client.zrem("REDIS_MATCH_SET", candidateStr);
						console.log(`Removed offline candidate: ${candidate.username}`);
						continue;
					}

					// MATCH FOUND - Canceling both users' searches immediately
					cancelSearch(userId);
					cancelSearch(candidate.userId);
					await client.zrem("REDIS_MATCH_SET", userKey, candidateStr);

					const userIsPlayer1 = Math.random() < 0.5;
					const player1 = {
						...(userIsPlayer1 ? userObj : candidate),
						color: "w"
					};
					const player2 = {
						...(userIsPlayer1 ? candidate : userObj),
						color: "b"
					};
					const roomId = `GM-${generateRoomId()}`;

					const gameRoom = {
						roomId,
						player1,
						player2,
						fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
						moves: [],
						status: "ongoing"
					} as RoomData;

					// Persisting room in Redis
					await client.set(`ROOM:${roomId}`, JSON.stringify(gameRoom));
					await client.expire(`ROOM:${roomId}`, 86400); // 24 hrs

					console.log(`Match found! Room: ${roomId}`);
					console.log(`Player1: ${player1.username} (${player1.color})`);
					console.log(`Player2: ${player2.username} (${player2.color})`);

					// Sending match found event to both players
					socket.emit("matchFound", gameRoom.roomId);
					io.to(candidateSocketId).emit("matchFound", gameRoom.roomId);

					return;
				}

				// No suitable candidates found, continuing search if still active and within time limit
				searchState = activeSearches.get(userId);
				if (searchState && searchState.searchActive && Date.now() - startTime < MAX_WAIT_TIME_MS) {
					// Scheduling next search attempt
					const timeoutId = setTimeout(tryFindMatch, 1000);
					searchState.timeoutId = timeoutId;
				} else if (searchState && searchState.searchActive) {
					// Timeout reached
					cancelSearch(userId);
					await client.zrem("REDIS_MATCH_SET", userKey);
					socket.emit("noMatchFound", "No suitable opponent found. Try again later.");
					console.log(`Search timeout for user: ${user.username}`);
				}
			} catch (error) {
				console.error("Error in tryFindMatch:", error);
				cancelSearch(userId);
				await client.zrem("REDIS_MATCH_SET", userKey);
				socket.emit("error", "Error occurred while searching for match.");
			}
		};

		socket.on("disconnect", () => {
			console.log(`User ${userId} disconnected, cancelling search`);
			cancelSearch(userId);
		});

		tryFindMatch();
	} catch (error) {
		console.error("Error in joinRoom:", error);
		cancelSearch(userId);
		socket.emit("error", "Server error while joining room.");
	}
};

// Helper function to cancel a user's search
const cancelSearch = (userId: Types.ObjectId): void => {
	const searchState = activeSearches.get(userId);
	if (searchState) {
		searchState.searchActive = false;
		if (searchState.timeoutId) {
			clearTimeout(searchState.timeoutId);
		}
		activeSearches.delete(userId);
		console.log(`Search cancelled for user: ${userId}`);
	}
};

export const getRoomData = async (req: Request, res: Response) => {
	try {
		const roomId = req.params.roomId;
		const data = await client.get(`ROOM:${roomId}`);

		if (data) {
			const room = JSON.parse(data);
			res.status(200).json(room);
		} else {
			res.status(400).json({ error: "Cannot find Room data" });
		}
	} catch (error) {
		console.log("Error in getRoomData controller", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
}

export const handleMove = async ({ roomId, userId, fen, move, socket }: HandleMoveProps) => {
	try {
		const data = await client.get(`ROOM:${roomId}`);

		if (!data) {
			socket.emit("roomNotFound", "Cannot find Room data");
			return;
		}

		const room = JSON.parse(data) as RoomData;

		const currentPlayer = room.player1.userId === userId ? room.player1 : room.player2;
		const opponentPlayer = room.player1.userId === userId ? room.player2 : room.player1;

		const currentTurn = room.fen.split(" ")[1];
		if (currentTurn !== currentPlayer.color) {
			socket.emit("notYourTurn", "Not your turn.");
			return;
		}

		room.fen = fen;
		room.moves.push(move);

		chess.load(fen);
		const isCheck = chess.inCheck();
		let gameEnded = false;

		if (chess.isCheckmate()) {
			room.status = "checkmate";
			gameEnded = true;
		} else if (chess.isStalemate()) {
			room.status = "stalemate";
			gameEnded = true;
		} else if (chess.isDraw()) {
			room.status = "draw";
			gameEnded = true;
		} else {
			room.status = "ongoing";
		}

		await client.set(`ROOM:${roomId}`, JSON.stringify(room));

		const opponentSocketId = await client.hget("player_sockets", opponentPlayer.userId);

		if (!opponentSocketId) {
			socket.emit("win", "Opponent disconnected. You win by abandonment.");
			return;
		}

		io.to(opponentSocketId).emit("handleMove", {
			opponentFen: fen,
			moves: room.moves,
			isCheck
		});

		if (gameEnded) {
			const statusPayload = {
				status: room.status,
				winner: room.status === "checkmate" ? currentPlayer.userId : null
			};

			io.to(opponentSocketId).emit("gameEnd", statusPayload);
			socket.emit("gameEnd", statusPayload);
		} else {
			const gameEval = await evaluateFEN(fen);
			console.log(gameEval);

			io.to(opponentSocketId).emit("gameEval", gameEval);
			socket.emit("gameEval", gameEval);
		}
	} catch (error) {
		console.error("Error in handleMove:", error);
		socket.emit("error", "Server error while handling move.");
	}
};

export const cleanupStates = async (userId: Types.ObjectId): Promise<void> => {
	try {
		cancelSearch(userId);

		const user = await User.findById(userId);
		if (user) {
			const userObj = {
				userId: user._id.toString(),
				username: user.username,
				elo: user.elo,
				nationality: user.nationality,
				profilePic: user.profilePic,
				gender: user.gender
			};
			const userKey = JSON.stringify(userObj);
			await client.zrem("REDIS_MATCH_SET", userKey);
			console.log(`Removed user ${user.username} from matching pool`);
		}

		const searchState = activeSearches.get(userId);

		if (searchState && searchState.searchActive) {
			searchState.searchActive = false;
			clearTimeout(searchState.timeoutId!);
			activeSearches.delete(userId);
		}
	} catch (error) {
		console.error("Error removing user from matching pool:", error);
	}
};