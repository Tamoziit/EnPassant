import express from 'express';
import { getToken } from '../controllers/admin.controller';

const router = express.Router();

router.post("/get-token", getToken);

export default router;