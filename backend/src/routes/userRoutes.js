import express from 'express';
import authenticate from '../middleware/authenticate.js';
import { getProfile } from '../controllers/userController.js';

const router = express.Router();

router.get('profile', authenticate, getProfile);

export default router;