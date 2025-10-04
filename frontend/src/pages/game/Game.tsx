import ChessBoard from "@/components/game/Chessboard";
import EvalBar from "@/components/game/EvalBar";
import MoveHistory from "@/components/game/MoveHistory";
import GameLoader from "@/components/GameLoader";
import AppNavbar from "@/components/navbars/AppNavbar";
import { useAuthContext } from "@/context/AuthContext";
import { useSocketContext } from "@/context/SocketContext";
import useGetRoomData from "@/hooks/useGetRoomData";
import type { Eval, RoomData } from "@/types";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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

	if (loading || !roomData || !authUser || !socket) return <GameLoader />;

	return (
		<>
			<AppNavbar />

			<div className="flex gap-6 items-center justify-center px-6 pt-20 pb-10 w-full">
				<EvalBar
					evalScore={evalScore.score}
					turn={evalScore.turn}
					colour={colour}
				/>

				<ChessBoard
					roomData={roomData}
					setRoomData={setRoomData}
					moves={moves}
					setMoves={setMoves}
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

export default Game;