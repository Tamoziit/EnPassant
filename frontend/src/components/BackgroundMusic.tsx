import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";

const BackgroundMusic = () => {
	const location = useLocation();
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [isPlaying, setIsPlaying] = useState(true);
	const [showButton, setShowButton] = useState(true);

	useEffect(() => {
		if (!audioRef.current) {
			audioRef.current = new Audio("/sounds/Title.mp3");
			audioRef.current.loop = true;
			audioRef.current.volume = 0.35;
		}

		const path = location.pathname;
		const isGamePage = /^\/(game|bot-game)\/.+/.test(path); // no music during ongoing game

		if (isGamePage) {
			audioRef.current.pause();
			setIsPlaying(false);
			setShowButton(false);
		} else {
			setShowButton(true);
			audioRef.current
				.play()
				.then(() => setIsPlaying(true))
				.catch(() => { });
		}
	}, [location.pathname]);

	const toggleMusic = () => {
		if (!audioRef.current) return;

		if (isPlaying) {
			audioRef.current.pause();
			setIsPlaying(false);
		} else {
			audioRef.current
				.play()
				.then(() => setIsPlaying(true))
				.catch(() => { });
		}
	};

	if (!showButton) return null;

	return (
		<button
			onClick={toggleMusic}
			className="fixed bottom-4 right-4 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-50 cursor-pointer"
			aria-label={isPlaying ? "Pause music" : "Play music"}
		>
			{isPlaying ? <HiVolumeUp size={24} /> : <HiVolumeOff size={24} />}
		</button>
	);
}

export default BackgroundMusic;