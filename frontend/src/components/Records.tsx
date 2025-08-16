import type { RecordProps } from "@/types";
import { Separator } from "./ui/separator";
import { FaBalanceScale, FaChessKnight, FaHandshake, FaTrophy } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import { AiFillThunderbolt } from "react-icons/ai";
import { GiPodiumWinner, GiSilverBullet } from "react-icons/gi";
import { BsGraphUpArrow } from "react-icons/bs";
import { FaFaceSadTear } from "react-icons/fa6";
import GameStatsBar from "./GameStatsBar";

interface Record {
	records: RecordProps;
}

const Records = ({ records }: Record) => {
	console.log(records);

	return (
		<div className="flex flex-col gap-6 w-full py-6">
			<div className="w-full flex flex-col gap-3">
				<div>
					<h1 className="text-gray-400 text-2xl font-medium flex items-center gap-2"><FaTrophy />Rating</h1>
					<Separator className="mt-2 mb-4" />
				</div>

				<div className="flex w-full gap-4 px-3">
					<div className="bg-gray-600/70 rounded-lg w-[130px] py-6 flex flex-col items-center justify-center">
						<IoMdTime className="text-gray-400 text-xl" />
						<span className="text-gray-400 text-lg">Rapid</span>
						<h1 className="text-gray-300 text-xl font-medium">{records.elo}</h1>
					</div>

					<div className="bg-gray-600/70 rounded-lg w-[130px] py-6 flex flex-col items-center justify-center">
						<AiFillThunderbolt className="text-gray-400 text-xl" />
						<span className="text-gray-400 text-lg">Blitz</span>
						<h1 className="text-gray-300 text-xl font-medium">{records.elo}</h1>
					</div>

					<div className="bg-gray-600/70 rounded-lg w-[130px] py-6 flex flex-col items-center justify-center">
						<GiSilverBullet className="text-gray-400 text-xl" />
						<span className="text-gray-400 text-lg">Bullet</span>
						<h1 className="text-gray-300 text-xl font-medium">{records.elo}</h1>
					</div>
				</div>
			</div>

			<div className="w-full flex flex-col gap-3">
				<div>
					<h1 className="text-gray-400 text-2xl font-medium flex items-center gap-2"><BsGraphUpArrow />Stats</h1>
					<Separator className="mt-2 mb-4" />
				</div>

				<div className="grid w-full gap-4 px-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
					<div className="bg-gray-600/70 rounded-lg py-6 flex flex-col items-center justify-center">
						<FaChessKnight className="text-gray-400 text-xl" />
						<span className="text-gray-400 text-lg">Played</span>
						<h1 className="text-gray-300 text-xl font-medium">{records.gameStats.played}</h1>
					</div>

					<div className="bg-gray-600/70 rounded-lg py-6 flex flex-col items-center justify-center">
						<GiPodiumWinner className="text-gray-400 text-xl" />
						<span className="text-gray-400 text-lg">Won</span>
						<h1 className="text-gray-300 text-xl font-medium">{records.gameStats.won}</h1>
					</div>

					<div className="bg-gray-600/70 rounded-lg py-6 flex flex-col items-center justify-center">
						<FaFaceSadTear className="text-gray-400 text-xl" />
						<span className="text-gray-400 text-lg">Lost</span>
						<h1 className="text-gray-300 text-xl font-medium">{records.gameStats.lost}</h1>
					</div>

					<div className="bg-gray-600/70 rounded-lg py-6 flex flex-col items-center justify-center">
						<FaHandshake className="text-gray-400 text-xl" />
						<span className="text-gray-400 text-lg">Draw</span>
						<h1 className="text-gray-300 text-xl font-medium">{records.gameStats.draw}</h1>
					</div>

					<div className="bg-gray-600/70 rounded-lg py-6 flex flex-col items-center justify-center">
						<FaBalanceScale className="text-gray-400 text-xl" />
						<span className="text-gray-400 text-lg">Stalemate</span>
						<h1 className="text-gray-300 text-xl font-medium">{records.gameStats.stalemate}</h1>
					</div>
				</div>

				<GameStatsBar
					stats={records.gameStats}
				/>
			</div>
		</div>
	)
}

export default Records;