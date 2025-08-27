import express from 'express';
import authenticate from '../middleware/authenticate.js';
import { reportResult } from '../controllers/gameController.js';

const router = express.Router();

router.get('/result', authenticate, reportResult);

export default router;