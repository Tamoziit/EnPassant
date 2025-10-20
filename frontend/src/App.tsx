import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Landing from "./pages/landing/Landing";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Home from "./pages/home/Home";
import { useAuthContext } from "./context/AuthContext";
import Profile from "./pages/profile/Profile";
import GameRoom from "./pages/game/GameRoom";
import Game from "./pages/game/Game";
import BotGame from "./pages/bot/BotGame";
import PlayBots from "./pages/bot/PlayBots";
import BackgroundMusic from "./components/BackgroundMusic";

function App() {
	const { authUser } = useAuthContext();

	return (
		<>
			<div className="min-h-screen bg-gradient-to-br from-slate-800 to-black">
				<BackgroundMusic />

				<Routes>
					<Route path="/" element={authUser ? <Navigate to="/home" /> : <Landing />} />
					<Route path="/login" element={authUser ? <Navigate to="/home" /> : <Login />} />
					<Route path="/signup" element={authUser ? <Navigate to="/home" /> : <Signup />} />
					<Route path="/home" element={authUser ? <Home /> : <Navigate to="/" />} />
					<Route path="/profile" element={authUser ? <Profile /> : <Navigate to="/" />} />
					<Route path="/game-room" element={authUser ? <GameRoom /> : <Navigate to="/" />} />
					<Route path="/game/:roomId" element={authUser ? <Game /> : <Navigate to="/" />} />
					<Route path="/bot-room" element={authUser ? <PlayBots /> : <Navigate to="/" />} />
					<Route path="/bot-game/:roomId" element={authUser ? <BotGame /> : <Navigate to="/" />} />
				</Routes>

				<Toaster />
			</div>
		</>
	)
}

export default App
