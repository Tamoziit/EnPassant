import type { ResultModalProps } from "@/types";
import { IoMdClose } from "react-icons/io";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const ResultModal = ({ roomData, status, winner, setShowModal }: ResultModalProps) => {
	const winningPlayer = roomData.player1.userId === winner ? roomData.player1 : roomData.player2;
	const losingPlayer = roomData.player1.userId === winner ? roomData.player2 : roomData.player1;
	const winningColour = winningPlayer.color === 'w' ? "White" : "Black";
	const navigate = useNavigate();

	const handleClose = () => {
		setShowModal(false);
	}

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
			<div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 relative">
				{status === "checkmate" && (
					<h1 className="text-3xl font-semibold text-center text-gray-300 mt-3"><span className="uppercase">{winningColour}</span> Won by Checkmate!</h1>
				)}

				<div className="flex items-center justify-between mt-7">
					<div className="flex flex-col w-1/2 items-center justify-center gap-2">
						<img src={winningColour === "White" ? "/WhiteKnight.png" : "/BlackKnight.png"} alt="winner" className="size-38" />
						<span className="text-2xl font-medium text-gray-300/60">{winningPlayer.username}</span>
					</div>

					<div>
						<span className="text-7xl text-gray-500">-</span>
					</div>

					<div className="flex flex-col w-1/2 items-center justify-center gap-2">
						<img src={winningColour === "White" ? "/BlackKnight.png" : "/WhiteKnight.png"} alt="loser" className="size-38" />
						<span className="text-2xl font-medium text-gray-300/60">{losingPlayer.username}</span>
					</div>
				</div>

				<button
					className="absolute top-0 right-0 p-3 border-none outline-none cursor-pointer"
					onClick={handleClose}
				>
					<IoMdClose className="text-3xl text-gray-400" />
				</button>

				<Button
					className="w-full mt-5 text-xl cursor-pointer"
					size="md"
					onClick={() => navigate("/game-room")}
				>
					New Game
				</Button>
			</div>
		</div>
	)
}

export default ResultModal;