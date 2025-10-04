import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import resizeToSquare from "./resizeToSquare";
import type { CloudinarySignature } from "@/types";

const uploadImageToCloudinary = async (
    fileUrl: string,
    getCloudinarySignature: () => Promise<CloudinarySignature>
): Promise<string | null> => {
    const CLOUDINARY_UPLOAD_URL = import.meta.env.VITE_CLOUDINARY_IMAGE_URL;
    const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;

    try {
        const { timestamp, signature, api_key } = await getCloudinarySignature();

        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error(`Failed to fetch blob: ${response.status}`);
        const blob = await response.blob();

        const compressedFile = await imageCompression(blob as File, {
            maxSizeMB: 50,
            maxWidthOrHeight: 1920,
            useWebWorker: true
        });

        const squareFile = await resizeToSquare(compressedFile, 220);

        const formData = new FormData();
        formData.append("file", squareFile);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("api_key", api_key);
        formData.append("upload_preset", CLOUDINARY_PRESET);

        const res = await fetch(CLOUDINARY_UPLOAD_URL, {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || "Upload failed");

        return data.secure_url;
    } catch (error) {
        console.log("Error uploading file: ", error);
        toast.error("Couldn't upload image");
        return null;
    }
}

export default uploadImageToCloudinary;