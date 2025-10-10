import AppNavbar from "@/components/navbars/AppNavbar";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/AuthContext";
import { useSocketContext } from "@/context/SocketContext";
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

	const handleStartBotGame = () => {
		if (!socket) return;

		if (!authUser?._id) {
			toast.error("User not authenticated");
			return;
		}

		socket.emit("playBot", { userId: authUser._id });
	};

	return (
		<>
			<AppNavbar />

			<div className="flex flex-col items-center justify-center w-full px-10 lg:px-16 pt-22 gap-6">
				<h1 className="text-4xl font-semibold metallic-underline metallic-text">
					Play Bots
				</h1>

				<div className="grid grid-cols-3 lg:grid-cols-4 w-full mt-6">
					<div className="flex flex-col items-center justify-center glassmorphic-2 rounded-lg p-4 gap-3">
						<img
							src="/Bot1.png"
							alt="Bot1"
							className="w-full lg:w-[350px] rounded-md"
						/>

						<div className="flex flex-col items-center justify-center">
							<span className="text-gray-300 text-xl font-medium text-center">Sorcerer Supreme</span>
							<span className="text-gray-500 font-medium -mt-1 text-center">3000</span>
						</div>

						<Button
							variant="default"
							size="sm"
							className="w-full text-base font-semibold ring-2 ring-blue-300 cursor-pointer"
							onClick={handleStartBotGame}
						>
							Play Online
						</Button>
					</div>
				</div>
			</div>
		</>
	)
}

export default PlayBots;