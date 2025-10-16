import ChessBoard from "@/components/game/Chessboard";
import DrawModal from "@/components/game/DrawModal";
import EvalBar from "@/components/game/EvalBar";
import MoveHistory from "@/components/game/MoveHistory";
import GameLoader from "@/components/GameLoader";
import AppNavbar from "@/components/navbars/AppNavbar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuthContext } from "@/context/AuthContext";
import { useSocketContext } from "@/context/SocketContext";
import useGetRoomData from "@/hooks/useGetRoomData";
import type { Eval, RoomData } from "@/types";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaFlag, FaHandshake } from "react-icons/fa";
import { useParams } from "react-router-dom";

const Game = () => {
	const { roomId } = useParams();
	const { authUser } = useAuthContext();
	const { socket } = useSocketContext();
	const { getRoomData, loading } = useGetRoomData();

	const [roomData, setRoomData] = useState<RoomData | null>(null);
	const [moves, setMoves] = useState<string[]>([]);
	const [evalScore, setEvalScore] = useState<Eval>({
		score: 0.0,
		turn: 'w'
	});
	const [colour, setColour] = useState<"w" | "b">("w");
	const [isEvalActive, setIsEvalActive] = useState<boolean>(true);
	const [isDrawModalActive, setIsDrawModalActive] = useState<boolean>(false);

	const fetchRoomData = async () => {
		if (roomId) {
			const data = await getRoomData(roomId);
			if (data) {
				setRoomData(data);
				setMoves(data.moves);

				const isPlayer1 = authUser?._id === data.player1.userId;
				const myColour = isPlayer1 ? data.player1.color : data.player2.color;
				setColour(myColour);
			}
		} else {
			toast.error("Room ID not found.");
		}
	};

	const handleResign = async () => {
		if (!socket || !roomData) {
			return;
		}

		socket.emit("resign", {
			roomId: roomData.roomId,
			userId: authUser?._id
		});
	}

	const handleDrawResolution = async (accepted: boolean) => {
		if (!socket || !roomData || !authUser) {
			toast.error("Error in Resolving Draw Offer");
			return;
		}

		socket.emit("drawResolution", {
			roomId: roomData.roomId,
			userId: authUser._id,
			accepted
		});
		setIsDrawModalActive(false);
	}

	const handleOfferDraw = async () => {
		if (!socket || !roomData) {
			toast.error("Error in Offering Draw");
			return;
		}

		socket.emit("offerDraw", {
			roomId: roomData.roomId,
			userId: authUser?._id
		});
	}

	useEffect(() => {
		fetchRoomData();
	}, [roomId]);

	useEffect(() => {
		if (!socket) return;

		const handleEval = (gameEval: Eval) => {
			setEvalScore(gameEval);
		}
		socket.off("gameEval", handleEval);
		socket.on("gameEval", handleEval);

		return () => {
			socket.off("gameEval", handleEval);
		}
	}, [socket]);

	useEffect(() => {
		if (!socket || !authUser) return;

		const handleDrawOffer = (offeringUserId: string) => {
			if (offeringUserId !== authUser._id) {
				setIsDrawModalActive(true);
			}
		};

		socket.on("drawOffered", handleDrawOffer);

		return () => {
			socket.off("drawOffered", handleDrawOffer);
		}
	}, [socket, authUser]);

	console.log(isDrawModalActive);

	if (loading || !roomData || !authUser || !socket) return <GameLoader />;

	return (
		<>
			<AppNavbar />

			<div className="flex flex-col items-center justify-center px-6 pt-20 w-full">
				<div className="w-full flex gap-2 items-center justify-end">
					<Label htmlFor="evalBar" className="text-sm text-gray-400 font-medium">
						{isEvalActive ? "Disable Eval Bar" : "Enable Eval Bar"}
					</Label>
					<Switch
						id="evalBar"
						checked={isEvalActive}
						onCheckedChange={setIsEvalActive}
						className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 cursor-pointer"
					/>
				</div>

				<div className="flex gap-6 items-center justify-center w-full">
					<EvalBar
						evalScore={evalScore.score}
						turn={evalScore.turn}
						colour={colour}
						isEnabled={isEvalActive}
					/>

					<ChessBoard
						roomData={roomData}
						setMoves={setMoves}
						socket={socket}
						authUser={authUser}
					/>

					<MoveHistory
						moves={moves}
					/>
				</div>

				<div className="w-full flex gap-6 items-center justify-end px-10">
					<button
						className="bg-transparent border-none outline-none cursor-pointer text-gray-400 hover:text-gray-300"
						onClick={handleResign}
					>
						<FaFlag className="text-xl" />
					</button>

					<button
						className="bg-transparent border-none outline-none cursor-pointer text-gray-400 hover:text-gray-300"
						onClick={handleOfferDraw}
					>
						<FaHandshake className="text-xl" />
					</button>
				</div>

				{isDrawModalActive && (
					<DrawModal
						onAccept={() => handleDrawResolution(true)}
						onDecline={() => handleDrawResolution(false)}
					/>
				)}
			</div>
		</>
	)
}

export default Game;