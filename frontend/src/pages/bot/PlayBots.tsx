import BotDisplayCard from "@/components/game/BotCard";
import AppNavbar from "@/components/navbars/AppNavbar";
import { useAuthContext } from "@/context/AuthContext";
import { useSocketContext } from "@/context/SocketContext";
import { bots } from "@/data/bots";
import type { Bot } from "@/types";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const PlayBots = () => {
	const { authUser } = useAuthContext();
	const navigate = useNavigate();
	const { socket } = useSocketContext();

	useEffect(() => {
		if (!socket) return;

		socket.on("startGame", (roomId: string) => {
			console.log("Bot game started:", roomId);
			navigate(`/bot-game/${roomId}`);
		});

		return () => {
			socket.off("startGame");
		};
	}, [navigate]);

	const handleStartBotGame = (bot: Bot) => {
		if (!socket) return;

		if (!authUser?._id) {
			toast.error("User not authenticated");
			return;
		}

		socket.emit("playBot", {
			botObj: bot,
			userId: authUser._id
		});
	};

	return (
		<>
			<AppNavbar />

			<div className="flex flex-col items-center justify-center w-full px-10 lg:px-16 pt-22 gap-6 pb-6">
				<h1 className="text-4xl font-semibold metallic-underline metallic-text">
					Play Bots
				</h1>

				<div className="grid grid-cols-3 lg:grid-cols-4 w-full mt-6 gap-2 lg:gap-4">
					{bots.map((bot) => (
						<BotDisplayCard
							key={bot.id}
							bot={bot}
							handleStartBotGame={() => handleStartBotGame(bot)}
						/>
					))}
				</div>
			</div>
		</>
	)
}

export default PlayBots;