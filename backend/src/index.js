import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import { connectDB } from './config/db.js';
import { Server } from 'socket.io';
import { createServer } from 'http';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api/game', gameRoutes);

app.get('/', (req, res) => {
    res.send("Pixel chess backend is LIVE");
})

const httpserver = createServer(app);
const io = new Server(httpserver, {
    cors: { origin: '*' },
});

io.on('connection', (socket) => {
    console.log('new client connected: ', socket.id);
})

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
})();

app.listen(PORT, () => {
    console.log(`Server listening at: ${PORT}`);
})