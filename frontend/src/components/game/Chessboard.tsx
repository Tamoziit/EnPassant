import { useAuthContext } from "@/context/AuthContext";
import useGetRoomData from "@/hooks/useGetRoomData";
import type { RoomData } from "@/types";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom"
import GameLoader from "../GameLoader";
import PlayerCard from "../PlayerCard";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useSocketContext } from "@/context/SocketContext";

const ChessBoard = () => {
	const { roomId } = useParams();
	const [roomData, setRoomData] = useState<RoomData | null>(null);
	const { authUser } = useAuthContext();
	const { loading, getRoomData } = useGetRoomData();
	const { socket } = useSocketContext();

	const chessRef = useRef(new Chess());
	const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

	const fetchRoomData = async () => {
		if (roomId) {
			const data = await getRoomData(roomId);
			setRoomData(data);
			setFen(data?.fen);
		} else {
			toast.error("Error in getting Room Data");
		}
	}

	const handleMove = ({ sourceSquare, targetSquare }: { piece: any; sourceSquare: string; targetSquare: string | null }) => {
		if (!targetSquare) {
			return false;
		}

		const currentTurn = fen.split(" ")[1];
		const isPlayer1 = authUser?._id === roomData?.player1.userId;
		const myColor = isPlayer1 ? roomData?.player1.color : roomData?.player2.color;

		if (currentTurn !== myColor) {
			toast.error("It's not your turn.");
			return false;
		}

		try {
			const move = chessRef.current.move({
				from: sourceSquare,
				to: targetSquare,
				promotion: "q",
			});

			if (move === null) return false;

			const updatedFen = chessRef.current.fen();
			setFen(updatedFen);

			if (roomId && authUser) {
				socket.emit("handleMove", {
					roomId,
					userId: authUser._id,
					fen: updatedFen,
				});
			}

			return true;
		} catch {
			return false;
		}
	};

	useEffect(() => {
		fetchRoomData();
	}, [roomId]);

	useEffect(() => {
		if (!roomId || !authUser || !socket) return;

		const handleOpponentMove = (opponentFen: string) => {
			try {
				chessRef.current.load(opponentFen);
				setFen(opponentFen);
			} catch (err) {
				console.error("Invalid FEN received:", opponentFen);
			}
		};

		socket.on("handleMove", handleOpponentMove);

		// Cleaning up listener on unmount
		return () => {
			socket.off("handleMove", handleOpponentMove);
		};
	}, [roomId, authUser, socket]);

	// Error handlers
	useEffect(() => {
		if (!socket) return;

		const handleNotYourTurn = (msg: string) => {
			toast.error(msg || "It's not your turn.");
		};

		const handleRoomNotFound = (msg: string) => {
			toast.error(msg || "Room not found.");
		};

		const handleGenericError = (msg: string) => {
			toast.error(msg || "An error occurred.");
		};

		socket.on("notYourTurn", handleNotYourTurn);
		socket.on("roomNotFound", handleRoomNotFound);
		socket.on("error", handleGenericError);

		return () => {
			socket.off("notYourTurn", handleNotYourTurn);
			socket.off("roomNotFound", handleRoomNotFound);
			socket.off("error", handleGenericError);
		};
	}, [socket]);

	// Result handlers
	useEffect(() => {
		if (!socket) return;

		const winByAbandonment = (msg: string) => {
			toast.success(msg || "Opponent Disconnect, You win by Abandonment!");
		};

		socket.on("win", winByAbandonment);

		return () => {
			socket.off("win", winByAbandonment);
		}
	}, [socket]);

	console.log(roomData);
	console.log(fen);

	if (loading || !roomData || !authUser) return <GameLoader />;

	const isPlayer1 = authUser._id === roomData.player1.userId;

	const me = isPlayer1 ? roomData.player1 : roomData.player2;
	const opponent = isPlayer1 ? roomData.player2 : roomData.player1;

	return (
		<div className="flex flex-col w-2/3 lg:w-[480px] items-center justify-center rounded-lg overflow-hidden">
			<PlayerCard {...opponent} />

			<div className="aspect-square">
				<Chessboard
					options={{
						position: fen,
						onPieceDrop: handleMove,
						boardOrientation: me.color === "w" ? "white" : "black",
						darkSquareStyle: { backgroundColor: "#1E3A8A" },
						lightSquareStyle: { backgroundColor: "#BFDBFE" },
						animationDurationInMs: 200
					}}
				/>
			</div>

			<PlayerCard {...me} />
		</div>
	)
}

export default ChessBoard;