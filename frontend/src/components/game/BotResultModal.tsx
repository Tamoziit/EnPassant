import type { BotResultModalProps } from "@/types";
import { IoMdClose } from "react-icons/io";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const BotResultModal = ({ botRoomData, status, winner, message, setShowModal }: BotResultModalProps) => {
	const navigate = useNavigate();
	const player = botRoomData.user;

	const bot = {
		userId: "BOT",
		username: "Sorcerer Supreme",
		elo: 3000,
		nationality: "UN",
		color: player.color === "w" ? "b" : "w",
	};

	let resultText = "";
	let leftPlayer, rightPlayer;

	if (status === "checkmate") {
		const humanWon = winner === player.userId;
		leftPlayer = humanWon ? player : bot;
		rightPlayer = humanWon ? bot : player;
		const winnerColor = leftPlayer.color === "w" ? "White" : "Black";
		resultText = `${winnerColor} Won by Checkmate!`;
	} else if (status === "draw") {
		leftPlayer = player;
		rightPlayer = bot;
		resultText = `Draw${message ? ` - ${message}` : ""}!`;
	} else if (status === "stalemate") {
		leftPlayer = player;
		rightPlayer = bot;
		resultText = "Draw by Stalemate!";
	} else {
		leftPlayer = player;
		rightPlayer = bot;
		resultText = "Game Over";
	}

	const handleClose = () => setShowModal(false);

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
			<div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 relative">
				<h1 className="text-3xl font-semibold text-center text-gray-300 mt-3">
					{resultText}
				</h1>

				<div className="flex items-center justify-between mt-7">
					{/* Left */}
					<div className="flex flex-col w-1/2 items-center justify-center gap-2">
						<img
							src={
								leftPlayer.userId === "BOT"
									? "/Bot1.png"
									: leftPlayer.color === "w"
										? "/WhiteKnight.png"
										: "/BlackKnight.png"
							}
							alt="player"
							className="size-36 rounded-full object-cover"
						/>
						<span className="text-2xl font-medium text-gray-300/80">
							{leftPlayer.username}
						</span>
					</div>

					<span className="text-7xl text-gray-500">-</span>

					{/* Right */}
					<div className="flex flex-col w-1/2 items-center justify-center gap-2">
						<img
							src={
								rightPlayer.userId === "BOT"
									? "/Bot1.png"
									: rightPlayer.color === "w"
										? "/WhiteKnight.png"
										: "/BlackKnight.png"
							}
							alt="opponent"
							className="size-36 rounded-full object-cover"
						/>
						<span className="text-2xl font-medium text-gray-300/80">
							{rightPlayer.username}
						</span>
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
					onClick={() => navigate("/bot-room")}
				>
					New Game
				</Button>
			</div>
		</div>
	);
};

export default BotResultModal;