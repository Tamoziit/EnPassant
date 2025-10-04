import express from "express";
import verifyToken from "../middlewares/auth.middleware";
import { getCloudinarySignature, getElo, getRecords, updateProfile } from "../controllers/profile.controller";

const router = express.Router();

router.patch("/update", verifyToken, updateProfile);
router.get("/get-my-elo", verifyToken, getElo);
router.get("/my-records", verifyToken, getRecords);
router.get("/get-signature", verifyToken, getCloudinarySignature);

export default router;