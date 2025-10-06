import express from "express";
import { getBotRoomData, getRoomData } from "../controllers/game.controller";
import verifyToken from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/game-room/:roomId", verifyToken, getRoomData);
router.get("/bot-room/:roomId", verifyToken, getBotRoomData);

export default router;