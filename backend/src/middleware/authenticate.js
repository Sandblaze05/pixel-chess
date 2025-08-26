import jwt from 'jsonwebtoken';
import { connectDB } from '../config/db';
import User from '../models/User';

const authenticate = async (req, res, next) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) {
            return res.status(401).json({ message: 'No authorization header' });
        }

        const token = auth.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const payload = jwt.verify(token, process.env.NEXTAUTH_SECRET);

        if (!payload?.id && !payload?.sub) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        await connectDB();
        const userId = payload.id || payload.sub;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Authentication error: ', err);
        return res.status(401).json({ message: 'Authentication failed' });
    }
}

export default authenticate;