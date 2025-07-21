import express from "express";
import verifyToken from "../middlewares/auth.middleware";
import { getElo, updateProfile } from "../controllers/profile.controller";

const router = express.Router();

router.patch("/update", verifyToken, updateProfile);
router.get("/get-my-elo", verifyToken, getElo);

export default router;