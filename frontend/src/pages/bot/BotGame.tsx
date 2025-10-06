import BotChessBoard from "@/components/game/BotChessBoard";
import EvalBar from "@/components/game/EvalBar";
import MoveHistory from "@/components/game/MoveHistory";
import GameLoader from "@/components/GameLoader";
import AppNavbar from "@/components/navbars/AppNavbar";
import { useAuthContext } from "@/context/AuthContext";
import { useSocketContext } from "@/context/SocketContext";
import useGetBotRoomData from "@/hooks/useGetBotRoomData";
import type { BotRoomData, Eval } from "@/types";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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

			<div className="flex gap-6 items-center justify-center px-6 pt-20 pb-10 w-full">
				<EvalBar
					evalScore={evalScore.score}
					turn={evalScore.turn}
					colour={colour}
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
		</>
	)
}

export default BotGame;