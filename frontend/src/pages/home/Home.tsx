import { Button } from "@/components/ui/button";
import AppNavbar from "../../components/navbars/AppNavbar";
import { useAuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import HeroModel from "@/components/HeroModel";

const Home = () => {
	const { authUser } = useAuthContext();
	const navigate = useNavigate();

	return (
		<>
			<AppNavbar />

			<div className="flex flex-col md:flex-row items-center justify-around px-10 lg:px-16 pt-20 gap-6 ">
				<div className="flex w-full md:2-2/3">
					<HeroModel />
				</div>

				<div className="flex flex-col items-center md:items-end gap-1 w-full md:w-1/3">
					<h1 className="text-gray-200 text-4xl lg:text-6xl font-semibold text-center md:text-right">
						Welcome
					</h1>
					<h2 className="text-blue-400 text-4xl md:text-5xl lg:text-7xl font-bold text-center md:text-right">
						{authUser?.fullName}
					</h2>

					<div className="w-full mt-6">
						<Button
							variant="default"
							size="lg"
							className="w-full  text-xl md:text-2xl md:font-bold ring-3 ring-blue-300 cursor-pointer"
							onClick={() => navigate("/game-room")}
						>
							Play Online
						</Button>
					</div>
				</div>
			</div>
		</>
	)
}

export default Home;