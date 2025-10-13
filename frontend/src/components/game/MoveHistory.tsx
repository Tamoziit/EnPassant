import { useEffect, useRef } from "react";
import { blackPieces, whitePieces } from "@/constants/ChessPieces";

interface MoveHistoryProps {
	moves: string[];
}

const MoveHistory = ({ moves }: MoveHistoryProps) => {
	const scrollRef = useRef<HTMLDivElement>(null);

	const getPieceFromMove = (move: string, isWhite: boolean) => {
		if (!move) return null;

		if (move === "O-O" || move === "O-O-O") {
			return isWhite ? whitePieces.K : blackPieces.K;
		}

		const cleanMove = move.replace(/[+#]$/, "");

		const firstChar = cleanMove[0];
		if (["K", "Q", "R", "B", "N"].includes(firstChar)) {
			return isWhite
				? whitePieces[firstChar as keyof typeof whitePieces]
				: blackPieces[firstChar as keyof typeof blackPieces];
		}

		return isWhite ? whitePieces.P : blackPieces.P;
	};
	
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [moves]);

	return (
		<div className="p-4 w-64 lg:w-80">
			<h2 className="text-xl mb-2 font-semibold text-gray-200">Move History</h2>

			<div className="w-full bg-gray-700/70 rounded-md shadow-md h-[580px] lg:h-[610px] p-4">
				<div
					ref={scrollRef}
					className="w-full bg-gray-900/70 h-full overflow-y-auto p-2"
				>
					<ol className="list-decimal space-y-1 pl-2 w-full">
						{moves.map((_, i) => {
							if (i % 2 !== 0) return null;

							const whiteMove = moves[i];
							const blackMove = moves[i + 1] || "";

							const moveNumber = i / 2 + 1;

							const whitePiece = getPieceFromMove(whiteMove, true);
							const blackPiece = getPieceFromMove(blackMove, false);

							return (
								<li
									key={i}
									className="text-sm font-medium text-gray-300/90 flex gap-2 items-center"
								>
									<span className="w-2 text-gray-400/70 flex-shrink-0">
										{moveNumber}.
									</span>

									{/* White move */}
									<div className="flex items-center gap-1 w-16">
										{whitePiece && (
											<span className="text-lg leading-none text-gray-200">
												{whitePiece}
											</span>
										)}
										<span className="text-xs">{whiteMove}</span>
									</div>

									{/* Black move */}
									<div className="flex items-center gap-1 w-16">
										{blackPiece && (
											<span className="text-lg leading-none text-gray-500">
												{blackPiece}
											</span>
										)}
										<span className="text-xs">{blackMove}</span>
									</div>
								</li>
							);
						})}
					</ol>
				</div>
			</div>
		</div>
	);
};

export default MoveHistory;