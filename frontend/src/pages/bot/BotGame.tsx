import BotChessBoard from "@/components/game/BotChessBoard";
import EvalBar from "@/components/game/EvalBar";
import MoveHistory from "@/components/game/MoveHistory";
import GameLoader from "@/components/GameLoader";
import AppNavbar from "@/components/navbars/AppNavbar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuthContext } from "@/context/AuthContext";
import { useSocketContext } from "@/context/SocketContext";
import useGetBotRoomData from "@/hooks/useGetBotRoomData";
import type { BotRoomData, Eval } from "@/types";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaFlag } from "react-icons/fa";
import { useParams } from "react-router-dom";

const BotGame = () => {
	const { roomId } = useParams();
	const { authUser } = useAuthContext();
	const { socket } = useSocketContext();
	const { loading, getBotRoomData } = useGetBotRoomData();

	const [botRoomData, setBotRoomData] = useState<BotRoomData | null>(null);
	const [moves, setMoves] = useState<string[]>([]);
	const [evalScore, setEvalScore] = useState<Eval>({
		score: 0.0,
		turn: 'w'
	});
	const [colour, setColour] = useState<"w" | "b">("w");
	const [isEvalActive, setIsEvalActive] = useState<boolean>(true);

	const fetchRoomData = async () => {
		if (roomId) {
			const data = await getBotRoomData(roomId);
			if (data) {
				setBotRoomData(data);
				setMoves(data.moves);

				setColour(data.user.color);
			}
		} else {
			toast.error("Room ID not found.");
		}
	};

	const handleResign = async () => {
		if (!socket || !botRoomData) {
			return;
		}

		socket.emit("botGameResign", {
			roomId: botRoomData.roomId,
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
		socket.off("botGameEval", handleEval);
		socket.on("botGameEval", handleEval);

		return () => {
			socket.off("botGameEval", handleEval);
		}
	}, [socket]);

	if (loading || !authUser || !socket || !botRoomData) return <GameLoader />;

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

					<BotChessBoard
						botRoomData={botRoomData}
						moves={moves}
						setMoves={setMoves}
						colour={colour}
						socket={socket}
						authUser={authUser}
					/>

					<MoveHistory
						moves={moves}
					/>
				</div>

				<div className="w-full flex gap-2 items-center justify-end px-10">
					<button
						className="bg-transparent border-none outline-none cursor-pointer text-gray-400 hover:text-gray-300"
						onClick={handleResign}
					>
						<FaFlag className="text-xl" />
					</button>
				</div>
			</div>
		</>
	)
}

export default BotGame;