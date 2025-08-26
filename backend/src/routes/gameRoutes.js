import express from 'express';
import authenticate from '../middleware/authenticate';
import { reportResult } from '../controllers/gameController';

const router = express.Router();

router.get('/result', authenticate, reportResult);

export default router;