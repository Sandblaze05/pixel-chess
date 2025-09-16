import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import jwt from "jsonwebtoken"
import userRoutes from './routes/userRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import { connectDB } from './config/db.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { createGame, makeMove, validateMove, getGameForUser, endGameByTimeout } from './services/gameService.js';
import User from './models/User.js';
import Game from './models/Game.js';

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
  cors: { origin: 'http://localhost:3000' },
});

// Game state management
let queues = {
  rapid: [],
  blitz: [],
  bullet: []
}

const activeGames = new Map(); // gameId -> game data
const playerSockets = new Map(); // userId -> socketId
const gameTimers = new Map(); // gameId -> timer data

const TIME_CONTROLS = {
  bullet: { initial: 60, increment: 0 }, // 1+0
  blitz: { initial: 300, increment: 0 }, // 5+0  
  rapid: { initial: 600, increment: 0 }  // 10+0
};

const findMatch = (queue, newPlayer, range = 100) => {
  return queue.find(p => Math.abs(p.rating - newPlayer.rating) <= range);
}

const searchIntervals = new Map();

const searchForOpponent = (newPlayer, mode) => {
  let range = 100;
  const interval = setInterval(() => {
    if (!queues[mode].find(p => p.socketId === newPlayer.socketId)) {
      clearInterval(interval);
      searchIntervals.delete(newPlayer.socketId);
      return;
    }
    const opponent = findMatch(queues[mode], newPlayer, range);

    if (opponent) {
      clearInterval(interval);
      searchIntervals.delete(newPlayer.socketId);
      queues[mode] = queues[mode].filter(p => p.socketId !== opponent.socketId);

      createGameAndNotify(newPlayer, opponent, mode);
    } else {
      range += 50;
      if (range > 500) range = 500; // Cap the search range
    }
  }, 3000);
  searchIntervals.set(newPlayer.socketId, interval);
};

const createGameAndNotify = async (player1, player2, mode) => {
  try {
    const assignColors = (p1, p2) => {
      return Math.random() < 0.5
        ? { white: p1, black: p2 }
        : { white: p2, black: p1 };
    };

    const { white, black } = assignColors(player1, player2);
    const game = await createGame(white.userId, black.userId, mode);

    // Initialize game timers
    const timeControl = TIME_CONTROLS[mode];
    const gameTimer = {
      white: timeControl.initial * 1000, // Convert to milliseconds
      black: timeControl.initial * 1000,
      increment: timeControl.increment * 1000,
      lastMoveTime: Date.now(),
      activePlayer: 'white'
    };
    gameTimers.set(game._id.toString(), gameTimer);

    // Store active game
    activeGames.set(game._id.toString(), {
      ...game.toObject(),
      timer: gameTimer
    });

    const gameRoom = `game-${game._id}`;
    const whiteSocket = io.sockets.sockets.get(white.socketId);
    const blackSocket = io.sockets.sockets.get(black.socketId);

    whiteSocket?.join(gameRoom);
    blackSocket?.join(gameRoom);

    // Get user info for both players
    const [whiteUser, blackUser] = await Promise.all([
      User.findById(white.userId).select('username image elo'),
      User.findById(black.userId).select('username image elo')
    ]);

    const gameData = {
      gameId: game._id,
      mode,
      status: 'ongoing',
      fen: game.fen,
      moves: [],
      white: {
        id: white.userId,
        username: whiteUser.username,
        image: whiteUser.image,
        rating: whiteUser.elo[mode],
        time: gameTimer.white
      },
      black: {
        id: black.userId,
        username: blackUser.username,
        image: blackUser.image,
        rating: blackUser.elo[mode],
        time: gameTimer.black
      },
      currentTurn: 'white',
      timeControl: TIME_CONTROLS[mode]
    };

    io.to(gameRoom).emit("gameStart", gameData);

    // Start the game timer
    startGameTimer(game._id.toString());

  } catch (error) {
    console.error('Error creating game:', error);
  }
};

const startGameTimer = (gameId) => {
  const timer = gameTimers.get(gameId);
  if (!timer) return;

  timer.intervalId = setInterval(() => {
    const now = Date.now();
    const elapsed = now - timer.lastMoveTime;

    if (timer.activePlayer === 'white') {
      timer.white = Math.max(0, timer.white - elapsed);
    } else {
      timer.black = Math.max(0, timer.black - elapsed);
    }

    timer.lastMoveTime = now;

    // Emit time update
    const gameRoom = `game-${gameId}`;
    io.to(gameRoom).emit("timeUpdate", {
      white: timer.white,
      black: timer.black
    });

    // Check for timeout
    if (timer.white <= 0 || timer.black <= 0) {
      handleTimeout(gameId, timer.white <= 0 ? 'white' : 'black');
    }
  }, 100); // Update every 100ms for smooth timer
};

const handleTimeout = async (gameId, timedOutColor) => {
  const timer = gameTimers.get(gameId);
  if (timer?.intervalId) {
    clearInterval(timer.intervalId);
  }

  try {
    const game = await Game.findById(gameId);
    if (!game) return;

    const timedOutPlayerId = timedOutColor === 'white' ? game.whitePlayer : game.blackPlayer;
    const result = await endGameByTimeout(gameId, timedOutPlayerId);

    if (result) {
      const gameRoom = `game-${gameId}`;
      io.to(gameRoom).emit("gameOver", {
        winner: result.winner,
        reason: "timeout",
        finalPosition: game.fen
      });

      // Clean up
      activeGames.delete(gameId);
      gameTimers.delete(gameId);
    }
  } catch (error) {
    console.error('Error handling timeout:', error);
  }
};

io.use(async (socket, next) => {
  try {
    const email = socket.handshake.auth.email; // client must send this
    // console.log(email);
    if (!email) return next(new Error("Authentication required"));

    const user = await User.findOne({ email });
    if (!user) return next(new Error("User not found"));

    socket.userId = user._id.toString(); // store ObjectId
    socket.user = user;

    next();
  } catch (err) {
    console.error("Socket auth error:", err);
    next(new Error("Authentication failed"));
  }
});


io.on('connection', (socket) => {
  const userId = socket.userId;
  console.log(`User ${socket.user.username} (${userId}) connected: ${socket.id}`);

  // Store player socket mapping
  playerSockets.set(userId, socket.id);

  // Send user their current state
  socket.emit('connected', {
    userId,
    username: socket.user.username,
    image: socket.user.image,
    elo: socket.user.elo,
    stats: socket.user.stats
  });

  socket.on("joinQueue", async ({ mode }) => {
    try {
      if (!['rapid', 'blitz', 'bullet'].includes(mode)) {
        return socket.emit("error", "Invalid game mode");
      }

      // Check if already in a game
      const activeGame = Array.from(activeGames.values()).find(game =>
        game.whitePlayer.toString() === userId || game.blackPlayer.toString() === userId
      );

      if (activeGame && activeGame.status === 'ongoing') {
        return socket.emit("error", "You are already in an active game");
      }

      const alreadyQueued = Object.values(queues).some(queue =>
        queue.find(p => p.userId === userId)
      );

      if (alreadyQueued) {
        return socket.emit("error", "Already in queue");
      }

      const rating = socket.user.elo[mode];
      const newPlayer = { socketId: socket.id, userId, rating, username: socket.user.username };
      const opponent = findMatch(queues[mode], newPlayer);

      if (!opponent) {
        queues[mode].push(newPlayer);
        socket.emit("queueJoined", {
          mode,
          estimatedWaitTime: Math.min(queues[mode].length * 5, 30),
          queuePosition: queues[mode].length
        });
        searchForOpponent(newPlayer, mode);
      } else {
        queues[mode] = queues[mode].filter(p => p.socketId !== opponent.socketId);
        await createGameAndNotify(newPlayer, opponent, mode);
      }
    } catch (error) {
      socket.emit("error", "Failed to join queue");
    }
  });

  socket.on("makeMove", async ({ gameId, move }) => {
    try {
      const moveResult = await validateMove(gameId, userId, move);

      if (!moveResult.valid) {
        return socket.emit("invalidMove", { error: moveResult.error });
      }

      // Update timer before move
      const timer = gameTimers.get(gameId);
      if (timer) {
        const now = Date.now();
        const elapsed = now - timer.lastMoveTime;

        if (timer.activePlayer === 'white') {
          timer.white = Math.max(0, timer.white - elapsed + timer.increment);
        } else {
          timer.black = Math.max(0, timer.black - elapsed + timer.increment);
        }

        timer.activePlayer = timer.activePlayer === 'white' ? 'black' : 'white';
        timer.lastMoveTime = now;
      }

      const result = await makeMove(gameId, move);
      const gameRoom = `game-${gameId}`;

      io.to(gameRoom).emit("moveMade", {
        move: result.move,
        fen: result.fen,
        playerId: userId,
        moveNumber: result.moveNumber,
        isCheck: result.isCheck,
        turn: result.turn,
        timeRemaining: timer ? { white: timer.white, black: timer.black } : null
      });

      if (result.status === "finished") {
        // Stop timer
        if (timer?.intervalId) {
          clearInterval(timer.intervalId);
        }

        io.to(gameRoom).emit("gameOver", {
          winner: result.winner,
          reason: result.reason,
          finalPosition: result.fen
        });

        // Clean up
        activeGames.delete(gameId);
        gameTimers.delete(gameId);
      }

    } catch (err) {
      socket.emit("invalidMove", { error: err.message });
    }
  });

  socket.on("joinGame", async ({ gameId }) => {
    try {
      const gameData = await getGameForUser(gameId, userId);
      const gameRoom = `game-${gameId}`;
      socket.join(gameRoom);

      // Get opponent info
      const opponentId = gameData.white.toString() === userId ? gameData.black : gameData.white;
      const opponent = await User.findById(opponentId).select('username image elo');

      const timer = gameTimers.get(gameId);

      socket.emit("gameJoined", {
        ...gameData,
        opponent: {
          id: opponentId,
          username: opponent.username,
          image: opponent.image,
          rating: opponent.elo[gameData.mode]
        },
        timeRemaining: timer ? { white: timer.white, black: timer.black } : null
      });

    } catch (error) {
      socket.emit("error", "Failed to join game: " + error.message);
    }
  });

  socket.on("requestDraw", async ({ gameId }) => {
    try {
      const game = await Game.findById(gameId);
      if (!game) return socket.emit("error", "Game not found");

      const isPlayer = game.whitePlayer.toString() === userId || game.blackPlayer.toString() === userId;
      if (!isPlayer) return socket.emit("error", "Not your game");

      const gameRoom = `game-${gameId}`;
      socket.to(gameRoom).emit("drawOffered", { from: userId });

    } catch (error) {
      socket.emit("error", "Failed to offer draw");
    }
  });

  socket.on("respondToDraw", async ({ gameId, accept }) => {
    try {
      if (accept) {
        const game = await Game.findById(gameId);
        game.status = 'finished';
        game.winner = null;
        await game.save();

        const gameRoom = `game-${gameId}`;
        io.to(gameRoom).emit("gameOver", {
          winner: null,
          reason: "draw_agreement"
        });

        // Clean up
        activeGames.delete(gameId);
        const timer = gameTimers.get(gameId);
        if (timer?.intervalId) {
          clearInterval(timer.intervalId);
        }
        gameTimers.delete(gameId);
      } else {
        const gameRoom = `game-${gameId}`;
        socket.to(gameRoom).emit("drawDeclined");
      }
    } catch (error) {
      socket.emit("error", "Failed to respond to draw");
    }
  });

  socket.on("resign", async ({ gameId }) => {
    try {
      const game = await Game.findById(gameId);
      if (!game) return socket.emit("error", "Game not found");

      const isPlayer = game.whitePlayer.toString() === userId || game.blackPlayer.toString() === userId;
      if (!isPlayer) return socket.emit("error", "Not your game");

      game.status = 'finished';
      game.winner = game.whitePlayer.toString() === userId ? game.blackPlayer : game.whitePlayer;
      await game.save();

      const gameRoom = `game-${gameId}`;
      io.to(gameRoom).emit("gameOver", {
        winner: game.winner,
        reason: "resignation"
      });

      // Clean up
      activeGames.delete(gameId);
      const timer = gameTimers.get(gameId);
      if (timer?.intervalId) {
        clearInterval(timer.intervalId);
      }
      gameTimers.delete(gameId);

    } catch (error) {
      socket.emit("error", "Failed to resign");
    }
  });

  socket.on("leaveQueue", ({ mode }) => {
    try {
      if (mode && queues[mode]) {
        queues[mode] = queues[mode].filter(p => p.userId !== userId);
      } else {
        Object.keys(queues).forEach(queueMode => {
          queues[queueMode] = queues[queueMode].filter(p => p.userId !== userId);
        });
      }

      if (searchIntervals.has(socket.id)) {
        clearInterval(searchIntervals.get(socket.id));
        searchIntervals.delete(socket.id);
      }

      socket.emit("queueLeft");
    } catch (error) {
      socket.emit("error", "Failed to leave queue");
    }
  });

  socket.on("getActiveGames", async () => {
    try {
      const userGames = await Game.find({
        $or: [{ whitePlayer: userId }, { blackPlayer: userId }],
        status: 'ongoing'
      }).populate('whitePlayer blackPlayer', 'username image').limit(10);

      socket.emit("activeGames", userGames);
    } catch (error) {
      socket.emit("error", "Failed to get active games");
    }
  });

  socket.on("sendMessage", ({ gameId, message }) => {
    try {
      if (message.trim().length === 0 || message.length > 200) return;

      const gameRoom = `game-${gameId}`;
      io.to(gameRoom).emit("messageReceived", {
        from: userId,
        username: socket.user.username,
        message: message.trim(),
        timestamp: Date.now()
      });
    } catch (error) {
      socket.emit("error", "Failed to send message");
    }
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.user.username} disconnected: ${socket.id}`);

    // Clean up
    playerSockets.delete(userId);

    if (searchIntervals.has(socket.id)) {
      clearInterval(searchIntervals.get(socket.id));
      searchIntervals.delete(socket.id);
    }

    for (const mode in queues) {
      queues[mode] = queues[mode].filter(p => p.userId !== userId);
    }
  });
});

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    httpserver.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    process.on("SIGINT", () => {
      console.log("Closing server...");
      // Clean up all timers
      gameTimers.forEach(timer => {
        if (timer.intervalId) {
          clearInterval(timer.intervalId);
        }
      });
      process.exit(0);
    });

  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
})();