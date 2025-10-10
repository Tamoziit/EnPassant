import type { MaterialInfo } from "@/types";

interface MaterialDisplayProps {
	materialInfo: MaterialInfo;
	color: "w" | "b"; // player's color
}

const pieceIcons: Record<string, string> = {
	p: "♙",
	n: "♘",
	b: "♗",
	r: "♖",
	q: "♕"
};

const Material = ({ materialInfo, color }: MaterialDisplayProps) => {
	const data = color === "w" ? materialInfo.capturedByWhite : materialInfo.capturedByBlack;

	const totalAdv = materialInfo.materialAdvantage;

	return (
		<div className={`flex items-center justify-center gap-0.5 text-base font-bold ${color === "w" ? 'text-black' : 'text-white'}`}>
			{Object.entries(data)
				.filter(([_, count]) => count > 0)
				.map(([piece, count]) => (
					<span key={piece} className="flex">
						{[...Array(count)].map((_, i) => (
							<span key={i} className="-ml-1.5">{pieceIcons[piece]}</span>
						))}
					</span>
				))}

			{(color === "w" && totalAdv > 0) || (color === "b" && totalAdv < 0) ? (
				<span className="ml-0.5 text-sm font-light text-gray-400">
					{`+${Math.abs(totalAdv)}`}
				</span>
			) : null}
		</div>
	);
}

export default Material;