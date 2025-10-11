import type { BotCardProps } from "@/types";
import Material from "./game/MaterialInfo";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import ReactCountryFlag from "react-country-flag";

const BotCard = ({materialInfo, color}: BotCardProps) => {
	return (
		<div className="w-full bg-gray-700/70 p-3 flex items-center gap-2">
			<Avatar className="size-12 lg:size-12">
				<AvatarImage src="/Bot1.png" />
				<AvatarFallback>
					Bot1
				</AvatarFallback>
			</Avatar>

			<div>
				<div className="flex flex-col">
					<span className="text-gray-300 text-base font-medium">
						Sorcerer Supreme
					</span>
				</div>

				<div className="flex gap-2 items-center mt-1">
					<span className="text-gray-400 text-base font-semibold">3000</span>
					<ReactCountryFlag
						countryCode="UN"
						svg
						style={{ width: '1.2em', height: '1.2em' }}
						title="Rest of the World"
					/>

					<div className="ml-2">
						<Material materialInfo={materialInfo} color={color} />
					</div>
				</div>
			</div>
		</div>
	)
}

export default BotCard;