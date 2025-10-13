import type { BotDisplayCardProps } from "@/types";
import { Button } from "../ui/button"

const BotDisplayCard = ({ bot, handleStartBotGame }: BotDisplayCardProps) => {
	return (
		<div className="flex flex-col items-center justify-center glassmorphic-2 rounded-lg p-4 gap-3">
			<img
				src={bot.image}
				alt={bot.id}
				className="w-full lg:w-[350px] rounded-md"
			/>

			<div className="flex flex-col items-center justify-center">
				<span className="text-gray-300 text-xl font-medium text-center">{bot.name}</span>
				<span className="text-gray-500 font-medium -mt-1 text-center">{bot.elo}</span>
			</div>

			<Button
				variant="default"
				size="sm"
				className="w-full text-base font-semibold ring-2 ring-blue-300 cursor-pointer"
				onClick={handleStartBotGame}
			>
				Start Game
			</Button>
		</div>
	)
}

export default BotDisplayCard;