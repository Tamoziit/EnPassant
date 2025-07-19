import { useState } from "react"
import toast from "react-hot-toast";
import type { SignupParams } from "../types";
import { useAuthContext } from "../context/AuthContext";

const useSignup = () => {
    const [loading, setLoading] = useState(false);
    const { setAuthUser } = useAuthContext();
    const apiUrl = import.meta.env.VITE_API_URL;

    const signup = async ({
        fullName,
        username,
        email,
        password,
        gender,
        nationality
    }: SignupParams) => {
        const success = handleInputErrors({
            fullName,
            username,
            email,
            password,
            gender,
            nationality
        });
        if (!success) return;

        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("EP-token")}`
                },
                body: JSON.stringify({
                    fullName,
                    username,
                    email,
                    password,
                    gender,
                    nationality
                })
            });
            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Storing user data with expiry
            const now = new Date().getTime();
            const expiry = now + 30 * 24 * 60 * 60 * 1000; // 30 days

            localStorage.setItem("EP-token", data.token);
            localStorage.setItem("EP-user", JSON.stringify(data));
            localStorage.setItem("EP-expiry", expiry.toString());
            setAuthUser(data);

            if (data) {
                toast.success("Signed up Successfully");
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
    return { loading, signup };
}

export default useSignup;


function handleInputErrors({
    fullName,
    username,
    email,
    password,
    gender,
    nationality
}: SignupParams) {
    if (!fullName || !username || !email || !password || !nationality || !gender) {
        toast.error("Please fill all the fields");
        return false;
    }

    if (username.length < 2) {
        toast.error("Username should be atleast 2 characters long");
        return false;
    }

    if (password.length < 6) {
        toast.error("Password should be atleast 6 characters long");
        return false;
    }

    if(gender !== "M" && gender !== "F" && gender !== "O") {
        toast.error("Enter a valid gender");
        return false;
    }

    return true;
}