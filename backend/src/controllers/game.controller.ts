import { Types } from "mongoose";
import User from "../models/user.model";
import client from "../redis/client";
import { io } from "../socket/socket";
import { JoinRoomProps } from "../types";

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

					const assignWhite = Math.random() < 0.5;
					const player1 = {
						...userObj,
						color: assignWhite ? "w" : "b"
					};
					const player2 = {
						...candidate,
						color: assignWhite ? "b" : "w"
					};

					// Deterministic Game Room ID (sorted userIds)
					const sortedIds = [player1.userId, player2.userId].sort();
					const roomId = `GM-${sortedIds[0]}:${sortedIds[1]}`;

					const gameRoom = {
						roomId,
						player1,
						player2,
						moves: [],
						status: "ongoing"
					};

					// Persisting room in Redis
					await client.set(`ROOM:${roomId}`, JSON.stringify(gameRoom));
					await client.expire(`ROOM:${roomId}`, 7200);

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
	} catch (err) {
		console.error("Error in joinRoom:", err);
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