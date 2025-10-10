import express from "express";
import { getRoomData } from "../controllers/game.controller";
import verifyToken from "../middlewares/auth.middleware";
import { getBotRoomData } from "../controllers/botGame.controller";

const router = express.Router();

router.get("/game-room/:roomId", verifyToken, getRoomData);
router.get("/bot-room/:roomId", verifyToken, getBotRoomData);

export default router;