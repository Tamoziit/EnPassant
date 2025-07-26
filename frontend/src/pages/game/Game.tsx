import ChessBoard from "@/components/game/Chessboard";
import MoveHistory from "@/components/game/MoveHistory";
import GameLoader from "@/components/GameLoader";
import AppNavbar from "@/components/navbars/AppNavbar";
import { useAuthContext } from "@/context/AuthContext";
import { useSocketContext } from "@/context/SocketContext";
import useGetRoomData from "@/hooks/useGetRoomData";
import type { RoomData } from "@/types";
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

	const fetchRoomData = async () => {
		if (roomId) {
			const data = await getRoomData(roomId);
			if (data) {
				setRoomData(data);
				setMoves(data.moves);
			}
		} else {
			toast.error("Room ID not found.");
		}
	};

	useEffect(() => {
		fetchRoomData();
	}, [roomId]);

	if (loading || !roomData || !authUser) return <GameLoader />;

	return (
		<>
			<AppNavbar />

			<div className="flex gap-6 items-center justify-center px-6 pt-20 pb-10 w-full">
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