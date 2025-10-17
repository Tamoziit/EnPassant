import type { BotChessBoardProps, BotResultProps, MaterialInfo, MoveProps } from "@/types";
import getOpeningByFEN from "@/utils/getOpeningByFEN";
import { Chess } from "chess.js";
import { useEffect, useRef, useState } from "react";
import { Chessboard, type PieceDataType } from "react-chessboard";
import toast from "react-hot-toast";
import Opening from "./Opening";
import PlayerCard from "../PlayerCard";
import BotCard from "../BotDisplayCard";
import BotResultModal from "./BotResultModal";
import { audioManager } from "@/utils/audioManager";
import playMusic from "@/utils/playMusic";

const BotChessBoard = ({ botRoomData, moves, setMoves, colour, socket, authUser }: BotChessBoardProps) => {
	const chessRef = useRef(new Chess());
	const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
	const [showModal, setShowModal] = useState(false);
	const [result, setResult] = useState<BotResultProps>({
		status: null,
		winner: null,
		message: ""
	});
	const [materialInfo, setMaterialInfo] = useState<MaterialInfo>(botRoomData.materialInfo);
	const [opening, setOpening] = useState<string>("");

	useEffect(() => {
		setFen(botRoomData.fen);
	}, [botRoomData]);

	const handleMove = ({ sourceSquare, targetSquare }: { piece: PieceDataType; sourceSquare: string; targetSquare: string | null }) => {
		if (!targetSquare) return false;

		const currentTurn = fen.split(" ")[1];
		if (currentTurn !== colour) {
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
			const newMoves = [...moves, moveNotation];

			setMoves((prev) => [...prev, moveNotation]);
			setFen(updatedFen);
			if (openingName !== "") {
				setOpening(openingName);
			}

			socket.emit("handlePlayerMove", {
				roomId: botRoomData.roomId,
				userId: authUser._id,
				fen: updatedFen,
				moves: newMoves
			});

			playMusic(moveNotation);
			return true;
		} catch (error) {
			return false;
		}
	}

	useEffect(() => {
		if (!botRoomData || !authUser || !socket) return;

		const handleOpponentMove = ({ opponentFen, moves, isCheck }: MoveProps) => {
			try {
				chessRef.current.load(opponentFen);
				const openingName = getOpeningByFEN(opponentFen);

				setFen(opponentFen);
				setMoves(moves);
				if (openingName !== "") {
					setOpening(openingName);
				}

				if (isCheck) {
					toast("CHECK!!", {
						icon: "♚",
						style: {
							background: "#1F2937",
							color: "#FACC15",
							border: "1px solid #FBBF24",
							boxShadow: "0 0 4px #FACC15",
							fontWeight: "semibold",
							fontSize: "16px",
						},
					});
				}

				playMusic(moves[moves.length - 1]);
			} catch (err) {
				console.error("Invalid FEN received:", opponentFen);
			}
		};

		socket.on("handleBotMove", handleOpponentMove);

		return () => {
			socket.off("handleBotMove", handleOpponentMove);
		};
	}, [botRoomData, authUser, socket]);

	// If user is black, triggering bot to play the first move
	useEffect(() => {
		if (!socket || !botRoomData || !authUser) return;

		if (botRoomData.user.color === "b") {
			socket.emit("handlePlayerMove", {
				roomId: botRoomData.roomId,
				userId: authUser._id,
				fen: botRoomData.fen,
				moves: []
			});
		}
	}, [socket, botRoomData, authUser]);

	// Material Info
	useEffect(() => {
		if (!socket) return;

		const getMaterialInfo = (materialInfo: MaterialInfo) => {
			setMaterialInfo(materialInfo);
		}

		socket.on("botMaterialInfo", getMaterialInfo);

		return () => {
			socket.off("botMaterialInfo", getMaterialInfo);
		}
	}, [socket]);

	// Error handlers
	useEffect(() => {
		if (!socket) return;

		const handleNotYourTurn = (msg: string) => {
			toast.error(msg || "It's not your turn.");
		};

		const handleInvalidMove = (msg: string) => {
			toast.error(msg || "Error in parsing Bot move");
		}

		const handleGenericError = (msg: string) => {
			toast.error(msg || "An error occurred.");
		};

		socket.on("notYourTurn", handleNotYourTurn);
		socket.on("InvalidMove", handleInvalidMove);
		socket.on("error", handleGenericError);

		return () => {
			socket.off("notYourTurn", handleNotYourTurn);
			socket.off("InvalidMove", handleInvalidMove);
			socket.off("error", handleGenericError);
		};
	}, [socket]);

	// Result handlers
	useEffect(() => {
		if (!socket) return;

		const gameResult = ({ status, winner, message }: BotResultProps) => {
			setResult({ status, winner, message });
			audioManager.playGameOver();
			setShowModal(true);
		}

		socket.on("botGameEnd", gameResult);

		return () => {
			socket.off("botGameEnd", gameResult);
		}
	}, [socket]);

	return (
		<div className="flex w-2/3 lg:w-[500px] flex-col gap-1">
			<div className="flex flex-col w-full items-center justify-center rounded-lg overflow-hidden">
				<BotCard {...botRoomData.bot} materialInfo={materialInfo} color={botRoomData.bot.color} />

				<div className="aspect-square">
					<Chessboard
						options={{
							position: fen,
							onPieceDrop: handleMove,
							boardOrientation: colour === "w" ? "white" : "black",
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
					<PlayerCard {...botRoomData.user} materialInfo={materialInfo} />
				</div>

				{result && showModal && (
					<BotResultModal
						botRoomData={botRoomData}
						status={result.status}
						winner={result.winner}
						message={result.message}
						setShowModal={setShowModal}
					/>
				)}
			</div>

			<Opening
				opening={opening}
			/>
		</div>
	)
}

export default BotChessBoard;