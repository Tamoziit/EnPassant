interface MoveHistoryProps {
	moves: string[];
}

const MoveHistory = ({ moves }: MoveHistoryProps) => {
	return (
		<div className="p-4 w-64 lg:w-80">
			<h2 className="text-xl mb-2 font-semibold text-gray-200">Move History</h2>

			<div className="w-full bg-gray-700/70 rounded-md shadow-md h-[580px] lg:h-[610px] p-4">
				<div className="w-full bg-gray-900/70 h-full overflow-y-auto p-2">
					<ol className="list-decimal space-y-1 pl-2 w-full">
						{moves.map((_, i) => {
							if (i % 2 !== 0) return null;

							const whiteMove = moves[i];
							const blackMove = moves[i + 1] || "";

							const moveNumber = i / 2 + 1;

							return (
								<li key={i} className="text-sm font-medium text-gray-300/90 flex gap-4">
									<span className="w-6 text-gray-400/70">{moveNumber}.</span>
									<span className="w-12">{whiteMove}</span>
									<span className="w-12">{blackMove}</span>
								</li>
							);
						})}
					</ol>
				</div>
			</div>
		</div>
	)
}

export default MoveHistory;