import ChessBoard from "@/components/game/Chessboard";
import AppNavbar from "@/components/navbars/AppNavbar";

const Game = () => {
	return (
		<>
			<AppNavbar />

			<div className="flex gap-6 items-center justify-center px-6 pt-20 pb-10 w-full">
				<ChessBoard />
			</div>
		</>
	)
}

export default Game;