import { Button } from "@/components/ui/button";
import AppNavbar from "../../components/navbars/AppNavbar";
import { useAuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import HeroModel from "@/components/HeroModel";
import { useEffect, useState } from "react";
import type { RecordProps } from "@/types";
import useGetRecords from "@/hooks/useGetRecords";
import toast from "react-hot-toast";
import Spinner from "@/components/Spinner";

const Home = () => {
	const { authUser } = useAuthContext();
	const [records, setRecords] = useState<RecordProps | null>(null);
	const { loading, getRecords } = useGetRecords();
	const navigate = useNavigate();

	const fetchRecords = async () => {
		const data = await getRecords();
		if (data) {
			setRecords(data);
		} else {
			toast.error("Error in fetching your Records!");
		}
	}

	useEffect(() => {
		fetchRecords();
	}, []);

	console.log(records);

	return (
		<>
			<AppNavbar />

			<div className="flex flex-col md:flex-row items-center justify-around px-10 lg:px-16 pt-22 gap-6 ">
				<div className="flex w-full md:w-1/2 lg:w-2/3">
					<HeroModel />
				</div>

				<div className="flex flex-col items-center md:items-end gap-1 w-full md:w-1/2 lg:w-1/3">
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

			<div className="flex w-full px-10 lg:px-16 mt-16 pb-10">
				{loading ? (
					<Spinner
					/>
				) : (
					<div className="flex items-center justify-center w-full">
						<h1 className="text-4xl font-semibold metallic-underline metallic-text">
							Your Records
						</h1>
					</div>
				)}
			</div>
		</>
	)
}

export default Home;