import { Types } from "mongoose";
import User from "../models/user.model";
import client from "../redis/client";
import { io } from "../socket/socket";
import { BotResult, DrawProps, DrawResolutionProps, HandleMoveProps, JoinRoomProps, PlayerData, ResignProps, RoomData, SearchState } from "../types";
import { Request, Response } from "express";
import generateRoomId from "../utils/generateRoomId";
import chess from "../services/chessEngine";
import evaluateFEN from "../services/stockfishEval";
import updateElo from "../utils/updateElo";
import getMaterialInfo from "../utils/materialInfo";
import getResult from "../utils/getResult";

const MAX_ELO_DIFF = 100;
const MAX_WAIT_TIME_MS = 30000;

const activeSearches = new Map<Types.ObjectId, SearchState>();

export const joinRoom = async ({ userId, timeControls, mode, socket }: JoinRoomProps) => {
	try {
		console.log(`Searching for match in ${mode} mode...`);

		const user = await User.findById(userId);
		if (!user) return socket.emit("error", "User not found");

		const userObj = {
			userId: user._id.toString(),
			username: user.username,
			elo: user.elo,
			nationality: user.nationality,
			profilePic: user.profilePic,
			gender: user.gender,
			mode
		};

		const userKey = JSON.stringify(userObj);
		const matchSetKey = `REDIS_MATCH_SET:${mode}`;

		// Checking if user is already searching
		if (activeSearches.has(userId)) {
			return socket.emit("error", "Already searching for a match");
		}

		const existingUser = await client.zscore(matchSetKey, userKey);
		if (existingUser !== null) {
			return socket.emit("error", "Already searching for a match");
		}

		// Adding user to per-mode Redis set
		await client.zadd(matchSetKey, user.elo, userKey);

		const members = await client.zrange(matchSetKey, 0, -1, "WITHSCORES");
		console.log(`Current ${mode} queue size:`, members.length / 2);

		// Initialize search state
		const searchState = {
			searchActive: true,
			timeoutId: null,
			mode
		};
		activeSearches.set(userId, searchState);

		const startTime = Date.now();

		const tryFindMatch = async (): Promise<void> => {
			try {
				let searchState = activeSearches.get(userId);
				if (!searchState || !searchState.searchActive) return;

				const minElo = user.elo - MAX_ELO_DIFF;
				const maxElo = user.elo + MAX_ELO_DIFF;

				// Only searching in this mode’s Redis set
				const candidates = await client.zrangebyscore(matchSetKey, minElo, maxElo);

				for (const candidateStr of candidates) {
					searchState = activeSearches.get(userId);
					if (!searchState || !searchState.searchActive) return;

					const candidate = JSON.parse(candidateStr);
					if (candidate.userId === userObj.userId) continue;
					if (candidate.mode !== mode) continue;

					const candidateSocketId = await client.hget("player_sockets", candidate.userId);
					if (!candidateSocketId) {
						await client.zrem(matchSetKey, candidateStr);
						console.log(`Removed offline candidate: ${candidate.username}`);
						continue;
					}

					// Match found
					cancelSearch(userId);
					cancelSearch(candidate.userId);
					await client.zrem(matchSetKey, userKey, candidateStr);

					const userIsPlayer1 = Math.random() < 0.5;
					const player1 = {
						...(userIsPlayer1 ? userObj : candidate),
						color: "w",
						timeRemaining: timeControls.initial * 60 * 1000
					} as PlayerData;
					const player2 = {
						...(userIsPlayer1 ? candidate : userObj),
						color: "b",
						timeRemaining: timeControls.initial * 60 * 1000
					} as PlayerData;

					const roomId = `GM-${generateRoomId()}`;
					const materialInfo = {
						"capturedByWhite": { "p": 0, "n": 0, "b": 0, "r": 0, "q": 0 },
						"capturedByBlack": { "p": 0, "n": 0, "b": 0, "r": 0, "q": 0 },
						"materialAdvantage": 0
					}

					const gameRoom = {
						roomId,
						player1,
						player2,
						fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
						moves: [],
						status: "ongoing",
						timeControl: {
							initial: timeControls.initial * 60 * 1000,
							increment: timeControls.increment * 1000
						},
						lastMoveTimestamp: Date.now(),
						materialInfo,
						mode
					} as RoomData;

					// Persisting room
					await client.set(`ROOM:${roomId}`, JSON.stringify(gameRoom));
					await client.expire(`ROOM:${roomId}`, 86400);
					await client.sadd("ACTIVE_GAMES", roomId);

					console.log(`Match found in ${mode}! Room: ${roomId}`);
					console.log(`Player1: ${player1.username} (${player1.color})`);
					console.log(`Player2: ${player2.username} (${player2.color})`);

					socket.emit("matchFound", gameRoom.roomId);
					io.to(candidateSocketId).emit("matchFound", gameRoom.roomId);

					const opponent = await User.findById(candidate.userId);
					if (!opponent) {
						socket.emit("error", "Error occurred while searching for match.");
						return;
					}

					user.gameStats = user.gameStats ?? {
						played: 0,
						won: 0,
						lost: 0,
						draw: 0,
						stalemate: 0
					};
					user.gameStats.played += 1;

					opponent.gameStats = opponent.gameStats ?? {
						played: 0,
						won: 0,
						lost: 0,
						draw: 0,
						stalemate: 0
					};
					opponent.gameStats.played += 1;

					await Promise.all([user.save(), opponent.save()]);
					return;
				}

				// No match yet — retrying if within wait time
				searchState = activeSearches.get(userId);
				if (searchState && searchState.searchActive && Date.now() - startTime < MAX_WAIT_TIME_MS) {
					const timeoutId = setTimeout(tryFindMatch, 1000);
					searchState.timeoutId = timeoutId;
				} else if (searchState && searchState.searchActive) {
					cancelSearch(userId);
					await client.zrem(matchSetKey, userKey);
					socket.emit("noMatchFound", "No suitable opponent found. Try again later.");
					console.log(`Search timeout for user: ${user.username} in ${mode}`);
				}
			} catch (error) {
				console.error("Error in tryFindMatch:", error);
				cancelSearch(userId);
				await client.zrem(matchSetKey, userKey);
				socket.emit("error", "Error occurred while searching for match.");
			}
		};

		socket.on("disconnect", () => {
			console.log(`User ${userId} disconnected, cancelling search`);
			cancelSearch(userId);
			client.zrem(matchSetKey, userKey);
		});

		tryFindMatch();
	} catch (error) {
		console.error("Error in joinRoom:", error);
		cancelSearch(userId);
		socket.emit("error", "Server error while joining room.");
	}
};

// Helper function to cancel a user's search
export const cancelSearch = async (userId: Types.ObjectId): Promise<void> => {
	const searchState = activeSearches.get(userId);
	if (!searchState) return;

	searchState.searchActive = false;
	if (searchState.timeoutId) clearTimeout(searchState.timeoutId);

	const matchSetKey = `REDIS_MATCH_SET:${searchState.mode}`;
	const members = await client.zrange(matchSetKey, 0, -1);

	for (const memberStr of members) {
		const member = JSON.parse(memberStr);
		if (member.userId === userId.toString()) {
			await client.zrem(matchSetKey, memberStr);
			console.log(`Removed user ${userId} from ${searchState.mode} queue`);
			break;
		}
	}

	activeSearches.delete(userId);
	console.log(`Search cancelled for user: ${userId}`);
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

		const opponentSocketId = await client.hget("player_sockets", opponentPlayer.userId);
		if (!opponentSocketId) {
			socket.emit("win", "Opponent disconnected. You win by abandonment.");
			await client.srem("ACTIVE_GAMES", roomId); // removing from active rooms
			return;
		}

		// Clock Logic
		const now = Date.now();
		const timeElapsed = now - (room.lastMoveTimestamp || now);

		currentPlayer.timeRemaining = Math.max(0, currentPlayer.timeRemaining - timeElapsed);

		// Checking for timeout
		if (currentPlayer.timeRemaining <= 0) {
			room.status = "timeout";
			await client.set(`ROOM:${roomId}`, JSON.stringify(room));
			await client.srem("ACTIVE_GAMES", roomId);

			const statusPayload = {
				status: "timeout",
				message: "Won by Timeout",
				winner: opponentPlayer.userId
			};

			io.to(opponentSocketId).emit("gameEnd", statusPayload);
			socket.emit("gameEnd", statusPayload);

			const { newRatingA, newRatingB } = updateElo(
				opponentPlayer.elo,
				currentPlayer.elo,
				1, // winner score
				32 // sensitivity
			);

			await Promise.all([
				User.updateOne(
					{ _id: opponentPlayer.userId },
					{
						$inc: { "gameStats.won": 1 },
						$set: { elo: Math.round(newRatingA) }
					}
				),
				User.updateOne(
					{ _id: currentPlayer.userId },
					{
						$inc: { "gameStats.lost": 1 },
						$set: { elo: Math.round(newRatingB) }
					}
				)
			]);

			return;
		}

		// Not flagged
		currentPlayer.timeRemaining += room.timeControl.increment;
		room.lastMoveTimestamp = now;

		room.fen = fen;
		room.moves.push(move);

		chess.reset();
		for (const m of room.moves) {
			chess.move(m);
		}

		const { capturedByWhite, capturedByBlack, materialAdvantage } = getMaterialInfo(chess);
		room.materialInfo = {
			capturedByWhite,
			capturedByBlack,
			materialAdvantage
		};

		const isCheck = chess.inCheck();
		let gameEnded = false;
		let message = "";

		const result = getResult(chess) as BotResult;
		room.status = result.status;
		gameEnded = result.gameEnded;
		message = result.message;

		await client.set(`ROOM:${roomId}`, JSON.stringify(room));

		io.to(opponentSocketId).emit("handleMove", {
			opponentFen: fen,
			moves: room.moves,
			isCheck,
			playerTimes: {
				[currentPlayer.userId]: currentPlayer.timeRemaining,
				[opponentPlayer.userId]: opponentPlayer.timeRemaining
			},
			lastMoveTimestamp: room.lastMoveTimestamp
		});

		io.to(opponentSocketId).emit("materialInfo", room.materialInfo);
		socket.emit("materialInfo", room.materialInfo);

		if (gameEnded) {
			await client.srem("ACTIVE_GAMES", roomId);

			const statusPayload = {
				status: room.status,
				message,
				winner: room.status === "checkmate" ? currentPlayer.userId : null
			};

			io.to(opponentSocketId).emit("gameEnd", statusPayload);
			socket.emit("gameEnd", statusPayload);

			if (room.status === "checkmate") {
				const { newRatingA, newRatingB } = updateElo(
					currentPlayer.elo,
					opponentPlayer.elo,
					1, // winner score
					32 // sensitivity
				);

				await Promise.all([
					User.updateOne(
						{ _id: currentPlayer.userId }, {
						$inc: { "gameStats.won": 1 },
						$set: { elo: Math.round(newRatingA) }
					}),
					User.updateOne(
						{ _id: opponentPlayer.userId }, {
						$inc: { "gameStats.lost": 1 },
						$set: { elo: Math.round(newRatingB) }
					})
				]);
			} else if (room.status === "draw") {
				await Promise.all([
					User.updateOne(
						{ _id: currentPlayer.userId }, {
						$inc: { "gameStats.draw": 1 },
					}),
					User.updateOne(
						{ _id: opponentPlayer.userId }, {
						$inc: { "gameStats.draw": 1 },
					})
				]);
			} else if (room.status === "stalemate") {
				await Promise.all([
					User.updateOne(
						{ _id: currentPlayer.userId }, {
						$inc: { "gameStats.stalemate": 1 },
					}),
					User.updateOne(
						{ _id: opponentPlayer.userId }, {
						$inc: { "gameStats.stalemate": 1 },
					})
				]);
			}
		}

		const gameEval = await evaluateFEN(fen);

		io.to(opponentSocketId).emit("gameEval", gameEval);
		socket.emit("gameEval", gameEval);
	} catch (error) {
		console.error("Error in handleMove:", error);
		socket.emit("error", "Server error while handling move.");
	}
};

export const checkRoomTimeout = async (roomId: string) => {
	try {
		const data = await client.get(`ROOM:${roomId}`);

		if (!data) {
			await client.srem("ACTIVE_GAMES", roomId);
			return;
		}

		const room = JSON.parse(data) as RoomData;

		if (room.status !== "ongoing") {
			await client.srem("ACTIVE_GAMES", roomId);
			return;
		}

		const now = Date.now();
		const timeElapsed = now - room.lastMoveTimestamp;
		const currentTurn = room.fen.split(" ")[1];

		const currentPlayer = currentTurn === room.player1.color ? room.player1 : room.player2;
		const opponentPlayer = currentTurn === room.player1.color ? room.player2 : room.player1;

		const actualTimeRemaining = currentPlayer.timeRemaining - timeElapsed;

		// Checking for timeout
		if (actualTimeRemaining <= 0) {
			room.status = "timeout";
			currentPlayer.timeRemaining = 0;
			await client.set(`ROOM:${roomId}`, JSON.stringify(room));

			// Removing from active games
			await client.srem("ACTIVE_GAMES", roomId);

			const statusPayload = {
				status: "timeout",
				message: "Won by Timeout",
				winner: opponentPlayer.userId
			};

			const currentPlayerSocketId = await client.hget("player_sockets", currentPlayer.userId);
			const opponentSocketId = await client.hget("player_sockets", opponentPlayer.userId);

			if (currentPlayerSocketId) {
				io.to(currentPlayerSocketId).emit("gameEnd", statusPayload);
			}
			if (opponentSocketId) {
				io.to(opponentSocketId).emit("gameEnd", statusPayload);
			}

			const { newRatingA, newRatingB } = updateElo(
				opponentPlayer.elo,
				currentPlayer.elo,
				1,
				32
			);

			await Promise.all([
				User.updateOne(
					{ _id: opponentPlayer.userId },
					{
						$inc: { "gameStats.won": 1 },
						$set: { elo: Math.round(newRatingA) }
					}
				),
				User.updateOne(
					{ _id: currentPlayer.userId },
					{
						$inc: { "gameStats.lost": 1 },
						$set: { elo: Math.round(newRatingB) }
					}
				)
			]);
		}
	} catch (error) {
		console.log(`Error checking timeout for room ${roomId}:`, error);
	}
};

export const handleResign = async ({ roomId, userId, socket }: ResignProps) => {
	try {
		const data = await client.get(`ROOM:${roomId}`);

		if (!data) {
			socket.emit("roomNotFound", "Cannot find Room data");
			return;
		}

		const room = JSON.parse(data) as RoomData;

		if (room.status !== "ongoing") {
			await client.srem("ACTIVE_GAMES", roomId);
			return;
		}

		const resigningPlayer = room.player1.userId === userId ? room.player1 : room.player2;
		const opponentPlayer = room.player1.userId === userId ? room.player2 : room.player1;
		const opponentSocketId = await client.hget("player_sockets", opponentPlayer.userId);

		room.status = "resignation";
		await client.set(`ROOM:${roomId}`, JSON.stringify(room));

		await client.srem("ACTIVE_GAMES", roomId);

		const statusPayload = {
			status: "resignation",
			message: "Won by Resignation",
			winner: opponentPlayer.userId
		};

		if (opponentSocketId) {
			io.to(opponentSocketId).emit("gameEnd", statusPayload);
		}
		socket.emit("gameEnd", statusPayload);

		const { newRatingA, newRatingB } = updateElo(
			opponentPlayer.elo,
			resigningPlayer.elo,
			1,
			32
		);

		await Promise.all([
			User.updateOne(
				{ _id: opponentPlayer.userId },
				{
					$inc: { "gameStats.won": 1 },
					$set: { elo: Math.round(newRatingA) }
				}
			),
			User.updateOne(
				{ _id: resigningPlayer.userId },
				{
					$inc: { "gameStats.lost": 1 },
					$set: { elo: Math.round(newRatingB) }
				}
			)
		]);
	} catch (error) {
		console.error("Error in handleResign:", error);
		socket.emit("error", "Server error while handling resign.");
	}
}

export const handleDrawOffer = async ({ roomId, userId, socket }: DrawProps) => {
	try {
		console.log("Draw Offered")
		const data = await client.get(`ROOM:${roomId}`);

		if (!data) {
			socket.emit("roomNotFound", "Cannot find Room data");
			return;
		}

		const room = JSON.parse(data) as RoomData;

		if (room.status !== "ongoing") {
			await client.srem("ACTIVE_GAMES", roomId);
			return;
		}

		const opponentPlayer = room.player1.userId === userId ? room.player2 : room.player1;
		const opponentSocketId = await client.hget("player_sockets", opponentPlayer.userId);

		if (opponentSocketId) {
			io.to(opponentSocketId).emit("drawOffered", userId);
		}
	} catch (error) {
		console.error("Error in handleDrawOffer:", error);
		socket.emit("error", "Server error while handling resign.");
	}
}

export const handleDrawResolution = async ({ roomId, userId, accepted, socket }: DrawResolutionProps) => {
	try {
		const data = await client.get(`ROOM:${roomId}`);

		if (!data) {
			socket.emit("roomNotFound", "Cannot find Room data");
			return;
		}

		const room = JSON.parse(data) as RoomData;

		if (room.status !== "ongoing") {
			await client.srem("ACTIVE_GAMES", roomId);
			return;
		}

		const currentPlayer = room.player1.userId === userId ? room.player1 : room.player2;
		const opponentPlayer = room.player1.userId === userId ? room.player2 : room.player1;
		const opponentSocketId = await client.hget("player_sockets", opponentPlayer.userId);

		if (accepted) {
			room.status = "draw";
			await client.set(`ROOM:${roomId}`, JSON.stringify(room));

			await client.srem("ACTIVE_GAMES", roomId);

			const statusPayload = {
				status: "draw",
				message: "by Mutual Agreement",
				winner: opponentPlayer.userId
			};

			if (opponentSocketId) {
				io.to(opponentSocketId).emit("gameEnd", statusPayload);
			}
			socket.emit("gameEnd", statusPayload);

			await Promise.all([
				User.updateOne(
					{ _id: currentPlayer.userId }, {
					$inc: { "gameStats.draw": 1 },
				}),
				User.updateOne(
					{ _id: opponentPlayer.userId }, {
					$inc: { "gameStats.draw": 1 },
				})
			]);
		} else {
			return;
		}
	} catch (error) {
		console.error("Error in handleDrawOffer:", error);
		socket.emit("error", "Server error while handling resign.");
	}
}

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