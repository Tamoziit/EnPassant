import type { ChessBoardProps, MaterialInfo, MoveProps, ResultProps } from "@/types";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import PlayerCard from "../PlayerCard";
import { Chess } from "chess.js";
import { Chessboard, type PieceDataType } from "react-chessboard";
import ResultModal from "./ResultModal";
import getOpeningByFEN from "@/utils/getOpeningByFEN";
import Opening from "./Opening";
import Timer from "./Timer";

const ChessBoard = ({ roomData, setMoves, socket, authUser }: ChessBoardProps) => {
	const chessRef = useRef(new Chess());
	const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
	const [playerTimes, setPlayerTimes] = useState({
		[roomData.player1.userId]: roomData.player1.timeRemaining!,
		[roomData.player2.userId]: roomData.player2.timeRemaining!
	});
	const [lastMoveTimestamp, setLastMoveTimestamp] = useState(roomData.lastMoveTimestamp || Date.now());
	const [showModal, setShowModal] = useState(false);
	const [result, setResult] = useState<ResultProps>({
		status: null,
		winner: null,
		message: ""
	});
	const [materialInfo, setMaterialInfo] = useState<MaterialInfo>(roomData.materialInfo);
	const [opening, setOpening] = useState<string>("");

	useEffect(() => {
		setFen(roomData.fen);
	}, [roomData]);

	const handleMove = ({ sourceSquare, targetSquare }: { piece: PieceDataType; sourceSquare: string; targetSquare: string | null }) => {
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
			const openingName = getOpeningByFEN(updatedFen);

			setMoves((prev) => [...prev, moveNotation]);
			setFen(updatedFen);
			if (openingName !== "") {
				setOpening(openingName);
			}

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

		const handleOpponentMove = ({ opponentFen, moves, isCheck, playerTimes: newPlayerTimes, lastMoveTimestamp: newTimestamp }: MoveProps) => {
			try {
				chessRef.current.load(opponentFen);
				const openingName = getOpeningByFEN(opponentFen);

				setFen(opponentFen);
				setMoves(moves);
				setPlayerTimes(newPlayerTimes);
				setLastMoveTimestamp(newTimestamp);
				if (openingName !== "") {
					setOpening(openingName);
				}

				if (isCheck) {
					toast("CHECK!!", {
						icon: "♚", // King symbol for chess
						style: {
							background: "#1F2937", // dark slate (almost black)
							color: "#FACC15", // golden yellow
							border: "1px solid #FBBF24", // strong golden border
							boxShadow: "0 0 4px #FACC15", // glowing effect
							fontWeight: "semibold",
							fontSize: "16px",
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
	
	// Material Info
	useEffect(() => {
		if (!socket) return;

		const getMaterialInfo = (materialInfo: MaterialInfo) => {
			setMaterialInfo(materialInfo);
		}

		socket.on("materialInfo", getMaterialInfo);

		return () => {
			socket.off("materialInfo", getMaterialInfo);
		}
	}, [socket]);

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

		const gameResult = ({ status, winner, message }: ResultProps) => {
			setResult({ status, winner, message });
			setShowModal(true);
		}

		socket.on("win", winByAbandonment);
		socket.on("gameEnd", gameResult);

		return () => {
			socket.off("win", winByAbandonment);
			socket.off("gameEnd", gameResult);
		}
	}, [socket]);

	const isPlayer1 = authUser._id === roomData.player1.userId;
	const me = isPlayer1 ? roomData.player1 : roomData.player2;
	const opponent = isPlayer1 ? roomData.player2 : roomData.player1;
	const currentTurn = fen.split(" ")[1];
	const isMyTurn = currentTurn === me.color;

	return (
		<div className="flex w-2/3 lg:w-[500px] flex-col gap-1">
			<div className="flex flex-col w-full items-center justify-center rounded-lg overflow-hidden">
				<div className="flex bg-gray-700/70 items-center justify-between w-full px-4">
					<PlayerCard {...opponent} materialInfo={materialInfo} />
					<Timer
						initialTime={playerTimes[opponent.userId]}
						isActive={!isMyTurn && roomData.status === "ongoing"}
						serverTime={playerTimes[opponent.userId]}
						lastMoveTimestamp={lastMoveTimestamp}
						status={result.status}
					/>
				</div>

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

				<div className="flex bg-gray-700/70 items-center justify-between w-full px-4">
					<PlayerCard {...me} materialInfo={materialInfo} />
					<Timer
						initialTime={playerTimes[me.userId]}
						isActive={isMyTurn && roomData.status === "ongoing"}
						serverTime={playerTimes[me.userId]}
						lastMoveTimestamp={lastMoveTimestamp}
						status={result.status}
					/>
				</div>

				{result && showModal && (
					<ResultModal
						roomData={roomData}
						status={result.status}
						winner={result.winner}
						message={result.message}
						setShowModal={setShowModal}
					/>
				)}
			</div>

			<Opening opening={opening} />
		</div>
	)
}

export default ChessBoard;