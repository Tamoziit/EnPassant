import type { ResultModalProps } from "@/types";
import { IoMdClose } from "react-icons/io";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";

const ResultModal = ({ roomData, status, winner, message, setShowModal }: ResultModalProps) => {
	const { authUser } = useAuthContext();
	const navigate = useNavigate();

	const player1 = roomData.player1;
	const player2 = roomData.player2;

	let leftPlayer, rightPlayer, leftColor;

	if (status === "checkmate" || status === "timeout" || status === "resignation" && winner) {
		const winningPlayer = player1.userId === winner ? player1 : player2;
		const losingPlayer = player1.userId === winner ? player2 : player1;
		leftPlayer = winningPlayer;
		rightPlayer = losingPlayer;
		leftColor = winningPlayer.color === "w" ? "White" : "Black";
	} else {
		// Draw or non-checkmate outcome → Auth user left
		leftPlayer = player1.userId === authUser?._id ? player1 : player2;
		rightPlayer = leftPlayer.userId === player1.userId ? player2 : player1;
		leftColor = leftPlayer.color === "w" ? "White" : "Black";
	}

	const handleClose = () => {
		setShowModal(false);
	};

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
			<div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 relative">
				{status === "checkmate" && (
					<h1 className="text-3xl font-semibold text-center text-gray-300 mt-3">
						<span className="uppercase">{leftColor}</span> Won by Checkmate!
					</h1>
				)}

				{status === "timeout" && (
					<h1 className="text-3xl font-semibold text-center text-gray-300 mt-3">
						<span className="uppercase">{leftColor}</span> Won by Timeout!
					</h1>
				)}

				{status === "resignation" && (
					<h1 className="text-3xl font-semibold text-center text-gray-300 mt-3">
						<span className="uppercase">{leftColor}</span> Won by Resignation!
					</h1>
				)}

				{status === "draw" && (
					<h1 className="text-3xl font-semibold text-center text-gray-300 mt-3">
						<span className="uppercase">Draw</span> {message}!
					</h1>
				)}

				{status === "stalemate" && (
					<h1 className="text-3xl font-semibold text-center text-gray-300 mt-3">
						<span className="uppercase">Draw</span> by Stalemate!
					</h1>
				)}

				<div className="flex items-center justify-between mt-7">
					{/* Left player */}
					<div className="flex flex-col w-1/2 items-center justify-center gap-2">
						<img
							src={leftPlayer.color === "w" ? "/WhiteKnight.png" : "/BlackKnight.png"}
							alt="left player"
							className="size-38"
						/>
						<span className="text-2xl font-medium text-gray-300/60">{leftPlayer.username}</span>
					</div>

					<div>
						<span className="text-7xl text-gray-500">-</span>
					</div>

					{/* Right player */}
					<div className="flex flex-col w-1/2 items-center justify-center gap-2">
						<img
							src={rightPlayer.color === "w" ? "/WhiteKnight.png" : "/BlackKnight.png"}
							alt="right player"
							className="size-38"
						/>
						<span className="text-2xl font-medium text-gray-300/60">{rightPlayer.username}</span>
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
	);
};

export default ResultModal;