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

const ChessBoard = () => {
	const { roomId } = useParams();
	const [roomData, setRoomData] = useState<RoomData | null>(null);
	const { authUser } = useAuthContext();
	const { loading, getRoomData } = useGetRoomData();

	const chessRef = useRef(new Chess());
	const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

	const fetchRoomData = async () => {
		if (roomId) {
			const data = await getRoomData(roomId);
			setRoomData(data);
		} else {
			toast.error("Error in getting Room Data");
		}
	}

	const handleMove = ({ sourceSquare, targetSquare }: { piece: any; sourceSquare: string; targetSquare: string | null }) => {
		if (!targetSquare) {
			return false;
		}

		try {
			const move = chessRef.current.move({
				from: sourceSquare,
				to: targetSquare,
				promotion: "q",
			});

			if (move === null) return false;

			setFen(chessRef.current.fen());
			return true;
		} catch {
			return false;
		}
	};

	useEffect(() => {
		fetchRoomData();
	}, [roomId]);

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