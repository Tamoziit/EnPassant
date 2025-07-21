import GameLoader from "@/components/GameLoader";
import AppNavbar from "@/components/navbars/AppNavbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthContext } from "@/context/AuthContext";
import useGetMyElo from "@/hooks/useGetMyElo";
import { useEffect, useState } from "react";
import ReactCountryFlag from "react-country-flag";

const GameRoom = () => {
	const { authUser } = useAuthContext();
	const [profilePic, setProfilePic] = useState(authUser?.profilePic || "");
	const [elo, setElo] = useState("");
	const { loading, getMyElo } = useGetMyElo();

	const getProfilePic = () => {
		if (!authUser?.profilePic) {
			const ProfilePic =
				authUser?.gender === "M"
					? `https://avatar.iran.liara.run/public/boy?username=${authUser?.fullName}`
					: `https://avatar.iran.liara.run/public/girl?username=${authUser?.fullName}`;

			setProfilePic(ProfilePic);
		}
	}

	const fetchElo = async () => {
		const data = await getMyElo();
		setElo(data);
	}

	useEffect(() => {
		getProfilePic();
		fetchElo();
	}, []);

	return (
		<>
			<AppNavbar />

			<div className="w-full min-h-screen flex flex-col lg:flex-row items-center justify-center px-4 lg:px-10 bg-gradient-to-br from-gray-900 to-black pt-16 gap-3 lg:gap-6">
				<div className="w-full lg:w-2/3">
					<GameLoader />
				</div>

				<div className="bg-gray-800/50 rounded-xl  p-4 lg:p-10 shadow-lg w-full lg:w-1/3 lg:h-[800px]">
					{authUser ? (
						<div className="flex gap-2 items-center">
							<Avatar>
								<AvatarImage src={profilePic} />
								<AvatarFallback>{authUser?.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
							</Avatar>

							<div>
								<div className="flex flex-col">
									<span className="text-gray-300 text-lg md:text-xl font-semibold">{authUser?.username}</span>
									<span className="text-gray-500 text-sm md:text-base font-medium">{authUser?.fullName}</span>
								</div>

								<div className="flex gap-2">
									<span className="text-gray-300 text-base font-semibold">{elo}</span>
									<ReactCountryFlag
										countryCode={authUser?.nationality}
										svg
										style={{
											width: '1.5em',
											height: '1.5em',
										}}
										title={authUser?.nationality}
									/>
								</div>
							</div>
						</div>
					) : (
						<div>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default GameRoom;