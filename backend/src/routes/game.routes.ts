import express from "express";
import { getRoomData } from "../controllers/game.controller";
import verifyToken from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/game-room/:roomId", verifyToken, getRoomData);

export default router;