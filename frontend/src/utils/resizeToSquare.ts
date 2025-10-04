const resizeToSquare = async (file: File, size = 220): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("Failed to get canvas context");

            canvas.width = size;
            canvas.height = size;

            const minSide = Math.min(img.width, img.height);
            const sx = (img.width - minSide) / 2;
            const sy = (img.height - minSide) / 2;

            ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject("Canvas blob is null");
                    resolve(new File([blob], "upload.jpg", { type: "image/jpeg" }));
                },
                "image/jpeg",
                0.9
            );
        }

        img.onerror = reject;
    });
}

export default resizeToSquare;