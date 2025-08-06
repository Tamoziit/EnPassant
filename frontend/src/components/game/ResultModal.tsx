import type { ResultModalProps } from "@/types";

const ResultModal = ({ roomData, status, winner }: ResultModalProps) => {
	const winningPlayer = roomData.player1.userId === winner ? roomData.player1 : roomData.player2;
	const losingPlayer = roomData.player1.userId === winner ? roomData.player2 : roomData.player1;
	const winningColour = winningPlayer.color === 'w' ? "White" : "Black";

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
			<div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 relative">
				{status === "checkmate" && (
					<span>{winningColour} Won by Checkmate!</span>
				)}

				<div>
					<div>
						<img src={winningColour === "White" ? "/WhiteKnight.png" : "/BlackKnight.png"} alt="winner" />
					</div>

					<div>
						<span>-</span>
					</div>

					<div>
						<img src={winningColour === "White" ? "/BlackKnight.png" : "/WhiteKnight.png"} alt="loser" />
					</div>
				</div>
			</div>
		</div>
	)
}

export default ResultModal;