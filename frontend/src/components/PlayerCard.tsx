import type { PlayerCardProps } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useEffect, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import Material from "./game/MaterialInfo";

const PlayerCard = ({ username, elo, nationality, profilePic, gender, color, materialInfo }: PlayerCardProps) => {
	const [profileImage, setProfileImage] = useState(profilePic || "");

	const getProfilePic = () => {
		if (!profilePic) {
			const ProfilePic =
				gender === "M"
					? `https://avatar.iran.liara.run/public/boy?username=${username}`
					: `https://avatar.iran.liara.run/public/girl?username=${username}`;
			setProfileImage(ProfilePic);
		}
	};

	useEffect(() => {
		getProfilePic();
	}, []);

	return (
		<div className="w-full py-3 flex items-center gap-2">
			<Avatar className="size-12 lg:size-12">
				<AvatarImage src={profileImage} />
				<AvatarFallback>
					{username.substring(0, 2).toUpperCase()}
				</AvatarFallback>
			</Avatar>

			<div>
				<div className="flex flex-col">
					<span className="text-gray-300 text-base font-medium">
						{username}
					</span>
				</div>

				<div className="flex gap-2 items-center mt-1">
					<span className="text-gray-400 text-base font-semibold">{elo}</span>
					<ReactCountryFlag
						countryCode={nationality}
						svg
						style={{ width: '1.2em', height: '1.2em' }}
						title={nationality}
					/>

					<div className="ml-2">
						<Material materialInfo={materialInfo} color={color} />
					</div>
				</div>
			</div>
		</div>
	)
}

export default PlayerCard;