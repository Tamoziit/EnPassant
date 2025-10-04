import { useEffect, useRef, useState } from "react";
import AppNavbar from "../../components/navbars/AppNavbar";
import { useAuthContext } from "../../context/AuthContext";
import Spinner from "../../components/Spinner";
import { FaPen } from "react-icons/fa";
import toast from "react-hot-toast";
import uploadImageToCloudinary from "@/utils/uploadImageToCloudinary";
import useGetCloudinarySignature from "@/hooks/useGetCloudinarySignature";
import Records from "@/components/Records";
import useGetRecords from "@/hooks/useGetRecords";
import type { RecordProps } from "@/types";
import ReactCountryFlag from "react-country-flag";
import useUpdateProfile from "@/hooks/useUpdateProfile";

const Profile = () => {
	const { authUser } = useAuthContext();
	const [profilePic, setProfilePic] = useState(authUser?.profilePic || "");
	const fileInputRef = useRef(null);
	const [uploading, setUploading] = useState<boolean>(false);
	const { loading: signing, getCloudinarySignature } = useGetCloudinarySignature();
	const { loading: updating, updateProfile } = useUpdateProfile();
	const [records, setRecords] = useState<RecordProps | null>(null);
	const { loading, getRecords } = useGetRecords();

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

	const getProfilePic = () => {
		if (!authUser?.profilePic) {
			const ProfilePic =
				authUser?.gender === "M"
					? `https://avatar.iran.liara.run/public/boy?username=${authUser?.fullName}`
					: `https://avatar.iran.liara.run/public/girl?username=${authUser?.fullName}`;

			setProfilePic(ProfilePic);
		}
	}

	const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		setUploading(true);

		try {
			const file = e.target.files?.[0];
			if (!file) {
				setUploading(false);
				return;
			}

			const previewUrl = URL.createObjectURL(file);
			setProfilePic(previewUrl);

			const uploadedUrl = await uploadImageToCloudinary(previewUrl, getCloudinarySignature);

			if (uploadedUrl) {
				await updateProfile(uploadedUrl);
				setProfilePic(uploadedUrl);
			} else {
				toast.error("Failed to upload profile picture");
			}
		} catch (error) {
			console.log("Profile pic upload error:", error);
			toast.error("Couldn't upload profile picture");
		} finally {
			setUploading(false);
		}
	};

	useEffect(() => {
		getProfilePic();
	}, []);

	if (profilePic == "" || !authUser) return (
		<div className="flex w-full min-h-screen items-center justify-center z-0">
			<Spinner size="large" />
		</div>
	)

	return (
		<>
			<AppNavbar />

			<div className="flex flex-col w-full min-h-screen items-center justify-center z-0 pt-22">
				<div className="glassmorphic-2 flex flex-col gap-2 items-center justify-center p-6 rounded-lg shadow-xl backdrop-blur-lg backdrop-filter mb-10 z-0">
					<div className="flex items-center justify-center relative">
						<img
							src={profilePic}
							alt={authUser?.username}
							className="w-[220px] rounded-full object-cover border-2 border-gray-300"
						/>

						<label
							htmlFor="profile-pic-upload"
							className="absolute bottom-0 right-6 bg-gray-700 p-2.5 rounded-full cursor-pointer hover:bg-gray-800 transition"
						>
							{uploading || signing || updating ? <Spinner size="small" /> : (
								<div>
									<FaPen className="size-5.5 text-white" />
									<input
										type="file"
										id="profile-pic-upload"
										className="hidden"
										accept="image/*"
										ref={fileInputRef}
										onChange={handleProfilePicChange}
									/>
								</div>
							)}
						</label>
					</div>

					<span className="font-bold text-xl text-gray-100">{authUser?.username}</span>

					<div className="flex flex-col items-start justify-center">
						<p className="text-gray-200">
							<b className="text-blue-400">Name: </b>
							{authUser?.fullName}
						</p>
						<p className="text-gray-200">
							<b className="text-blue-400">Email: </b>
							{authUser?.email}
						</p>
						<p className="text-gray-200">
							<b className="text-blue-400">Gender: </b>
							{authUser?.gender === "M" ? "Male" : "Female"}
						</p>
						<p className="text-gray-200">
							<b className="text-blue-400">Nationality: </b>
							<ReactCountryFlag
								countryCode={authUser?.nationality}
								svg
								style={{ width: '1.5em', height: '1.5em' }}
								title={authUser?.nationality}
							/>
						</p>
					</div>
				</div>

				<div className="flex w-full px-6 lg:px-16 pb-10">
					{loading ? (
						<Spinner
						/>
					) : (
						<div className="flex flex-col items-center justify-center w-full">
							<h1 className="text-4xl font-semibold metallic-underline metallic-text">
								Your Records
							</h1>

							{records ? (
								<Records
									records={records}
								/>
							) : (
								<div className="flex w-full items-center justify-center mt-6">
									<span className="text-gray-500">Cannot fetch records. Try again later!</span>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</>
	)
}

export default Profile;