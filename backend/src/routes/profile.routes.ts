import express from "express";
import verifyToken from "../middlewares/auth.middleware";
import { updateProfile } from "../controllers/profile.controller";

const router = express.Router();

router.patch("/update", verifyToken, updateProfile);

export default router;