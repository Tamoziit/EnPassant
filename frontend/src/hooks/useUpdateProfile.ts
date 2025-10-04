import { useState } from "react"
import { useAuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

const useUpdateProfile = () => {
    const [loading, setLoading] = useState(false);
    const { setAuthUser } = useAuthContext();
    const apiUrl = import.meta.env.VITE_API_URL;

    const updateProfile = async (profilePic: string) => {
        const success = handleInputErrors(profilePic);

        if (!success) return;

        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/profile/update`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("EP-token")}`
                },
                body: JSON.stringify({ profilePic })
            });
            const data = await res.json();

            if (data.error) {
                throw new Error(data.error)
            }

            const now = new Date().getTime();
            const expiry = now + 30 * 24 * 60 * 60 * 1000;

            localStorage.setItem("EP-token", data.token);
            localStorage.setItem("EP-user", JSON.stringify(data));
            localStorage.setItem("EP-expiry", expiry.toString());
            setAuthUser(data);

            if (data) {
                toast.success("Profile updated successfully");
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
                console.log(error);
            } else {
                console.log("An unknown error occurred", error);
            }
        } finally {
            setLoading(false);
        }
    }

    return { loading, updateProfile }
}

export default useUpdateProfile;


function handleInputErrors(profilePic: string) {
    if (!profilePic) {
        toast.error("New Profile Picture is required");
        return false;
    }

    return true;
}