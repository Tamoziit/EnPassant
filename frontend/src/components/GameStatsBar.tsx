import type { GameStats } from "@/types";
import { FaRegSmile, FaRegMeh, FaRegFrown, FaBalanceScale } from "react-icons/fa";

interface Stats {
    stats: GameStats;
}

const GameStatsBar = ({ stats }: Stats) => {
    const { played, won, lost, draw, stalemate } = stats;

    const wonPct = played ? (won / played) * 100 : 0;
    const lostPct = played ? (lost / played) * 100 : 0;
    const drawPct = played ? (draw / played) * 100 : 0;
    const stalematePct = played ? (stalemate / played) * 100 : 0;

    return (
        <div className="w-full md:w-[80%] mx-auto p-4 rounded-xl shadow-md">
            {/* Top numbers */}
            <div className="flex justify-between text-lg font-semibold mb-2">
                <span className="text-green-500">{won}</span>
                <span className="text-gray-400">{draw}</span>
                <span className="text-yellow-500">{stalemate}</span>
                <span className="text-red-500">{lost}</span>
            </div>

            {/* Segmented Bar */}
            <div className="flex h-3 w-full overflow-hidden rounded-full">
                <div className="bg-green-500" style={{ width: `${wonPct}%` }} />
                <div className="bg-gray-500" style={{ width: `${drawPct}%` }} />
                <div className="bg-yellow-500" style={{ width: `${stalematePct}%` }} />
                <div className="bg-red-500" style={{ width: `${lostPct}%` }} />
            </div>

            {/* Bottom percentages */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mt-2 font-medium w-full">
                <span className="flex items-center gap-1 text-green-500">
                    <FaRegSmile /> {wonPct.toFixed(1)}% Won
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                    <FaRegMeh /> {drawPct.toFixed(1)}% Draw
                </span>
                <span className="flex items-center gap-1 text-yellow-500">
                    <FaBalanceScale /> {stalematePct.toFixed(1)}% Stalemate
                </span>
                <span className="flex items-center gap-1 text-red-500">
                    <FaRegFrown /> {lostPct.toFixed(1)}% Lost
                </span>
            </div>
        </div>
    );
};

export default GameStatsBar;
