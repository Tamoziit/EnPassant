import GameLoader from "@/components/GameLoader";
import AppNavbar from "@/components/navbars/AppNavbar";
import Spinner from "@/components/Spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuthContext } from "@/context/AuthContext";
import useGetMyElo from "@/hooks/useGetMyElo";
import { useEffect, useState, useCallback } from "react";
import ReactCountryFlag from "react-country-flag";
import { IoMdTime } from "react-icons/io";
import { AiFillThunderbolt } from "react-icons/ai";
import { GiSilverBullet } from "react-icons/gi";
import { Button } from "@/components/ui/button";
import { useSocketContext } from "@/context/SocketContext";
import { useNavigate } from "react-router-dom";

const GameRoom = () => {
	const { authUser } = useAuthContext();
	const [profilePic, setProfilePic] = useState(authUser?.profilePic || "");
	const [elo, setElo] = useState("");
	const { loading, getMyElo } = useGetMyElo();
	const { socket } = useSocketContext();
	const [searching, setSearching] = useState(false);
	const navigate = useNavigate();

	const getProfilePic = () => {
		if (!authUser?.profilePic) {
			const ProfilePic =
				authUser?.gender === "M"
					? `https://avatar.iran.liara.run/public/boy?username=${authUser?.fullName}`
					: `https://avatar.iran.liara.run/public/girl?username=${authUser?.fullName}`;
			setProfilePic(ProfilePic);
		}
	};

	const fetchElo = async () => {
		const data = await getMyElo();
		setElo(data);
	};

	useEffect(() => {
		if (authUser) {
			getProfilePic();
			fetchElo();
		}
	}, [authUser]);

	// Memoize the callback to prevent unnecessary re-renders
	const handleMatchFound = useCallback((gameRoom: string) => {
		setSearching(false);
		navigate(`/game/${gameRoom}`);
	}, [navigate]);

	const handleSearchError = useCallback((error: string) => {
		console.error("Search error:", error);
		setSearching(false);
		// You might want to show an error toast here
	}, []);

	const handleNoMatch = useCallback((message: string) => {
		console.log("No match found:", message);
		setSearching(false);
		// You might want to show a message to the user
	}, []);

	useEffect(() => {
		if (!socket) return;

		console.log("Setting up socket listeners");

		// Clean up any existing listeners to prevent duplicates
		socket.off("matchFound");
		socket.off("error");
		socket.off("noMatchFound");

		// Add event listeners
		socket.on("matchFound", handleMatchFound);
		socket.on("error", handleSearchError);
		socket.on("noMatchFound", handleNoMatch);

		return () => {
			// Clean up listeners on unmount
			socket.off("matchFound", handleMatchFound);
			socket.off("error", handleSearchError);
			socket.off("noMatchFound", handleNoMatch);
		};
	}, [socket, handleMatchFound, handleSearchError, handleNoMatch]);

	const handleStartGame = () => {
		if (!authUser || searching || !socket) return;

		console.log("Starting game search for user:", authUser._id);
		setSearching(true);

		socket.emit("joinRoom", {
			userId: authUser._id,
		});
	};

	const handleCancelSearch = () => {
		if (!searching || !socket) return;

		console.log("Cancelling search");
		setSearching(false);

		socket.emit("cancelSearch", {
			userId: authUser?._id,
		});
	};

	return (
		<>
			<AppNavbar />

			<div className="w-full min-h-screen flex flex-col lg:flex-row items-center justify-center px-4 lg:px-10 bg-gradient-to-br from-gray-900 to-black pt-16 gap-3 lg:gap-6 pb-4">
				<div className="w-full lg:w-2/3">
					<GameLoader />
				</div>

				<div className="bg-gray-800/50 rounded-xl p-6 lg:p-10 shadow-lg w-full lg:w-1/3 lg:h-[700px]">
					{authUser ? (
						<>
							<div className="flex gap-4 items-center">
								<Avatar>
									<AvatarImage src={profilePic} />
									<AvatarFallback>
										{authUser?.username?.substring(0, 2).toUpperCase()}
									</AvatarFallback>
								</Avatar>

								<div>
									<div className="flex flex-col">
										<span className="text-gray-300 text-lg md:text-xl font-semibold">
											{authUser?.username}
										</span>
										<span className="text-gray-500 text-sm md:text-base font-medium">
											{authUser?.fullName}
										</span>
									</div>

									<div className="flex gap-2 items-center mt-1">
										{loading ? (
											<Spinner
												size="small"
												color="primary"
											/>
										) : (
											<span className="text-gray-300 text-base font-semibold">{elo}</span>
										)}
										<ReactCountryFlag
											countryCode={authUser?.nationality}
											svg
											style={{ width: '1.5em', height: '1.5em' }}
											title={authUser?.nationality}
										/>
									</div>
								</div>
							</div>

							<Separator className="my-4" />

							<div className="flex flex-col gap-3">
								<h1 className="text-gray-400 text-xl font-medium">Start a Game</h1>

								<div className="flex gap-2">
									<Badge className="text-base w-20 text-gray-300/70"><IoMdTime /> Rapid</Badge>
									<Separator orientation="vertical" className="mx-3" />
									<Badge className="text-base w-20 text-gray-300/70"><AiFillThunderbolt /> Blitz</Badge>
									<Separator orientation="vertical" className="mx-3" />
									<Badge className="text-base w-20 text-gray-300/70"><GiSilverBullet /> Bullet</Badge>
								</div>

								<div className="flex items-center gap-1 text-gray-400/70 text-lg">
									<IoMdTime />
									<span>10 mins</span>
								</div>

								{!searching ? (
									<Button
										variant="default"
										size="md"
										className="w-full text-lg md:text-xl md:font-semibold ring-2 ring-blue-300 cursor-pointer"
										onClick={handleStartGame}
									>
										Start a New Game
									</Button>
								) : (
									<div className="flex flex-col gap-2">
										<Button
											variant="default"
											size="md"
											className="w-full text-lg md:text-xl md:font-semibold ring-2 ring-blue-300 cursor-pointer"
											disabled
										>
											<div className="flex gap-2 items-center justify-center">
												<Spinner size="small" color="accent" />
												<span className="ml-2">Searching for opponent...</span>
											</div>
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="w-full text-sm"
											onClick={handleCancelSearch}
										>
											Cancel Search
										</Button>
									</div>
								)}
							</div>
						</>
					) : (
						<div className="text-center">
							<Avatar className="mx-auto mb-4">
								<AvatarFallback>GU</AvatarFallback>
							</Avatar>
							<p className="text-gray-300 font-semibold text-lg">Guest User</p>
							<p className="text-gray-500 text-sm">Not logged in</p>
							<div className="mt-2">
								<ReactCountryFlag
									countryCode="UN"
									svg
									style={{ width: '1.5em', height: '1.5em' }}
									title="Unknown"
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default GameRoom;