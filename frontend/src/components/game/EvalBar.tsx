import type { EvalBarProps } from "@/types";

const mapEvalToPercentage = (score: number): number => {
    const k = 0.6; // sensitivity factor, lower = more sensitive
    const scaled = 100 / (1 + Math.exp(-k * score)); // sigmoid mapping
    return Math.max(1, Math.min(99, Math.round(scaled))); // keeping within [1%, 99%]
};

const EvalBar = ({ evalScore, colour }: EvalBarProps) => {
    let percentage = 50;
    let displayText = "";
    let isWhiteText = false;

    if (typeof evalScore === "number") {
        percentage = mapEvalToPercentage(evalScore);

        displayText = `${Math.abs(evalScore).toFixed(1)}`;
        isWhiteText = evalScore < 0;
    } else if (typeof evalScore === "string") {
        const isWhiteMate = !evalScore.includes("-");
        percentage = isWhiteMate ? 100 : 0;

        const mateMoves = evalScore.split(" ")[2]?.replace("-", "") || "";
        displayText = `M${mateMoves}`;
        isWhiteText = !isWhiteMate;
    }

    console.log(colour)

    return (
        <div className={`relative flex flex-col items-center w-8 h-[580px] lg:h-[610px] rounded bg-neutral-400 overflow-hidden border border-gray-700 shadow-inner ${colour === "w" ? "rotate-180" : ""}`}>
            <div
                className="w-full bg-white transition-all duration-300"
                style={{ height: `${percentage}%` }}
            />
            <div
                className="w-full bg-black transition-all duration-300"
                style={{ height: `${100 - percentage}%` }}
            />
            <div
                className={`absolute w-full text-center text-sm font-mono transition-all duration-300
                    ${isWhiteText ? "text-white bottom-2" : "text-black top-2"} ${colour === "w" ? "rotate-180" : ""}`}
            >
                {displayText}
            </div>
        </div>
    );
};

export default EvalBar;
