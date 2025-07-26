import type { ChessBoardProps, MoveProps } from "@/types";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import PlayerCard from "../PlayerCard";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

const ChessBoard = ({ roomData, setRoomData, moves, setMoves, socket, authUser }: ChessBoardProps) => {
	const chessRef = useRef(new Chess());
	const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

	useEffect(() => {
		setFen(roomData.fen);
	}, [roomData]);

	const handleMove = ({ sourceSquare, targetSquare }: { piece: any; sourceSquare: string; targetSquare: string | null }) => {
		if (!targetSquare) return false;

		const currentTurn = fen.split(" ")[1];
		const isPlayer1 = authUser?._id === roomData.player1.userId;
		const myColor = isPlayer1 ? roomData.player1.color : roomData.player2.color;

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

			if (!move) return false;

			const moveNotation = move.san;
			const updatedFen = chessRef.current.fen();

			setMoves((prev) => [...prev, moveNotation]);
			setFen(updatedFen);

			socket.emit("handleMove", {
				roomId: roomData.roomId,
				userId: authUser._id,
				fen: updatedFen,
				move: moveNotation
			});

			return true;
		} catch {
			return false;
		}
	};

	useEffect(() => {
		if (!roomData || !authUser || !socket) return;

		const handleOpponentMove = ({ opponentFen, moves, isCheck }: MoveProps) => {
			try {
				chessRef.current.load(opponentFen);
				setFen(opponentFen);
				setMoves(moves);

				if (isCheck) {
					toast("CHECK!!", {
						icon: "⚠️",
						style: {
							background: "#FEF3C7",
							color: "#92400E",
							border: "1px solid #FACC15",
						},
					});
				}
			} catch (err) {
				console.error("Invalid FEN received:", opponentFen);
			}
		};
		
		socket.on("handleMove", handleOpponentMove);

		// Cleaning up listener on unmount
		return () => {
			socket.off("handleMove", handleOpponentMove);
		};
	}, [roomData, authUser, socket]);

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
	console.log(moves);

	const isPlayer1 = authUser._id === roomData.player1.userId;
	const me = isPlayer1 ? roomData.player1 : roomData.player2;
	const opponent = isPlayer1 ? roomData.player2 : roomData.player1;

	return (
		<div className="flex flex-col w-2/3 lg:w-[500px] items-center justify-center rounded-lg overflow-hidden">
			<PlayerCard {...opponent} />

			<div className="aspect-square">
				<Chessboard
					options={{
						position: fen,
						onPieceDrop: handleMove,
						boardOrientation: me.color === "w" ? "white" : "black",
						darkSquareStyle: { backgroundColor: "#1E3A8A" },
						lightSquareStyle: { backgroundColor: "#BFDBFE" },
						dropSquareStyle: {
							backgroundColor: "#FDE68A"
						},
						animationDurationInMs: 200
					}}
				/>
			</div>

			<PlayerCard {...me} />
		</div>
	)
}

export default ChessBoard;