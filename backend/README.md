# Pixel-Chess-Backend

## Socket Connection Setup

```javascript
import io from 'socket.io-client';

const socket = io('your-server-url', {
  auth: {
    email: email 
  }
});
```

## Events You Can Emit (Frontend → Backend)

### 1\. Queue Management

```javascript
// Join matchmaking queue
socket.emit('joinQueue', { mode: 'rapid' }); // 'rapid', 'blitz', or 'bullet'

// Leave queue
socket.emit('leaveQueue', { mode: 'rapid' }); // or omit mode to leave all queues
```

### 2\. Game Actions

```javascript
// Make a move
socket.emit('makeMove', {
  gameId: 'gameId123',
  move: 'e4' // SAN notation or {from: 'e2', to: 'e4'}
});

// Join/rejoin a game
socket.emit('joinGame', { gameId: 'gameId123' });

// Resign from game
socket.emit('resign', { gameId: 'gameId123' });

// Offer draw
socket.emit('requestDraw', { gameId: 'gameId123' });

// Respond to draw offer
socket.emit('respondToDraw', { 
  gameId: 'gameId123', 
  accept: true // or false
});
```

### 3\. Chat \& Info

```javascript
// Send chat message
socket.emit('sendMessage', {
  gameId: 'gameId123',
  message: 'Good game!'
});

// Get active games
socket.emit('getActiveGames');
```

## Events Client Listens For (Backend → Frontend)

### 1\. Connection \& Authentication

```javascript
socket.on('connected', (data) => {
  console.log('Connected as:', data);
  // data: { userId, username, avatar, elo, stats }
});

socket.on('error', (message) => {
  console.log('Error:', message);
});
```

### 2\. Queue Events

```javascript
socket.on('queueJoined', (data) => {
  console.log('Joined queue:', data);
  // data: { mode, estimatedWaitTime, queuePosition }
});

socket.on('queueLeft', () => {
  console.log('Left queue');
});
```

### 3\. Game Start

```javascript
socket.on('gameStart', (gameData) => {
  console.log('Game started:', gameData);
  // gameData structure:
  /\*
  {
    gameId: "64f123...",
    mode: "rapid",
    status: "ongoing",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moves: \[],
    white: {
      id: "userId1",
      username: "player1",
      avatar: "avatar.jpg",
      rating: 1500,
      time: 600000 // milliseconds
    },
    black: {
      id: "userId2", 
      username: "player2",
      avatar: "avatar2.jpg",
      rating: 1450,
      time: 600000
    },
    currentTurn: "white",
    timeControl: { initial: 600, increment: 0 }
  }
  \*/
});
```

### 4\. Game Updates

```javascript
socket.on('moveMade', (moveData) => {
  console.log('Move made:', moveData);
  // moveData structure:
  /\*
  {
    move: "e4", // SAN notation
    fen: "new\_position\_fen",
    playerId: "userId\_who\_moved",
    moveNumber: 1,
    isCheck: false,
    turn: "b", // whose turn is next
    timeRemaining: { white: 595000, black: 600000 }
  }
  \*/
});

socket.on('timeUpdate', (timeData) => {
  // Real-time time updates (every 100ms during active games)
  console.log('Time update:', timeData);
  // timeData: { white: 595000, black: 590000 }
});

socket.on('invalidMove', (error) => {
  console.log('Invalid move:', error);
  // error: { error: "It's not your turn" }
});
```

### 5\. Game End

```javascript
socket.on('gameOver', (result) => {
  console.log('Game over:', result);
  // result structure:
  /\*
  {
    winner: "userId" || null, // null for draws
    reason: "checkmate" | "timeout" | "resignation" | "draw\_agreement" | "stalemate",
    finalPosition: "final\_fen"
  }
  \*/
});
```

### 6\. Draw Offers

```javascript
socket.on('drawOffered', (data) => {
  console.log('Draw offered by:', data.from);
  // Show draw offer UI
});

socket.on('drawDeclined', () => {
  console.log('Draw offer declined');
  // Hide draw offer UI
});
```

### 7\. Game Joining

```javascript
socket.on('gameJoined', (gameData) => {
  console.log('Joined game:', gameData);
  // Complete game state for rejoining
  /\*
  {
    gameId: "64f123...",
    fen: "current\_position",
    status: "ongoing",
    moves: \["e4", "e5", "Nf3"],
    mode: "rapid",
    white: "userId1",
    black: "userId2", 
    winner: null,
    yourColor: "white",
    isYourTurn: true,
    isCheck: false,
    opponent: {
      id: "userId2",
      username: "opponent",
      avatar: "avatar.jpg",
      rating: 1450
    },
    timeRemaining: { white: 580000, black: 575000 }
  }
  \*/
});
```

### 8\. Chat

```javascript
socket.on('messageReceived', (messageData) => {
  console.log('New message:', messageData);
  // messageData: { from: "userId", username: "player1", message: "gg!", timestamp: 1234567890 }
});
```

### 9\. Active Games

```javascript
socket.on('activeGames', (games) => {
  console.log('Your active games:', games);
  // Array of game objects
});
```

## Frontend State Management Example

```javascript
class ChessGameManager {
  constructor() {
    this.socket = null;
    this.currentGame = null;
    this.gameState = {
      fen: null,
      moves: \[],
      playerColor: null,
      turn: 'w',
      timeRemaining: { white: 0, black: 0 },
      gameStatus: 'waiting', // 'waiting', 'playing', 'finished'
      opponent: null
    };
  }

  connect(token) {
    this.socket = io('your-server-url', { auth: { token } });
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on('connected', (data) => {
      this.userInfo = data;
    });

    this.socket.on('gameStart', (gameData) => {
      this.currentGame = gameData.gameId;
      this.gameState = {
        ...this.gameState,
        fen: gameData.fen,
        playerColor: gameData.white.id === this.userInfo.userId ? 'white' : 'black',
        timeRemaining: {
          white: gameData.white.time,
          black: gameData.black.time
        },
        gameStatus: 'playing',
        opponent: gameData.white.id === this.userInfo.userId ? gameData.black : gameData.white
      };
      this.onGameStart(this.gameState);
    });

    this.socket.on('moveMade', (moveData) => {
      this.gameState.fen = moveData.fen;
      this.gameState.moves.push(moveData.move);
      this.gameState.turn = moveData.turn;
      this.gameState.timeRemaining = moveData.timeRemaining;
      this.onMoveMade(moveData);
    });

    this.socket.on('timeUpdate', (timeData) => {
      this.gameState.timeRemaining = timeData;
      this.onTimeUpdate(timeData);
    });

    this.socket.on('gameOver', (result) => {
      this.gameState.gameStatus = 'finished';
      this.onGameOver(result);
    });

    // Add other event listeners...
  }

  joinQueue(mode) {
    this.socket.emit('joinQueue', { mode });
  }

  makeMove(move) {
    if (this.currentGame) {
      this.socket.emit('makeMove', {
        gameId: this.currentGame,
        move
      });
    }
  }

  // Callback methods to override in your UI
  onGameStart(gameState) {}
  onMoveMade(moveData) {}
  onTimeUpdate(timeData) {}
  onGameOver(result) {}
}
```

## Error Handling

Always handle these error cases:

* Authentication failures
* Invalid moves
* Network disconnections
* Game not found errors
* Permission errors

## Time Management

The backend sends time updates every 1000ms during active games.

This comprehensive system provides everything needed for a fully functional chess application with real-time multiplayer capabilities.

