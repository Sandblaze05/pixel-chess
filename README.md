# 👾Pixel Chess♟️
<img width="475" height="250" alt="image" src="https://github.com/user-attachments/assets/d5b2d3e1-74bf-4080-b51c-c5efadda5cbf" />


Pixel Chess is a web-based chess platform that supports online multiplayer matches, user authentication, and real-time gameplay. The application is built with a Next.js frontend and an Express/Socket.IO backend, providing a seamless and interactive chess experience.

---

## Features

- Play chess in real time against other users
- Multiple game modes: Bullet, Blitz, and Rapid
- Secure authentication with email/password and Google (NextAuth)
- Responsive chessboard UI with drag-and-drop moves, promotion handling, and highlights
- Player ratings (ELO), win/loss/draw statistics
- Live in-game chat
- Resume active games and view game history
- Guilds and training modules (planned)
- AI training mode (planned)

---

## Tech Stack

- **Frontend:** Next.js (React), NextAuth for authentication
- **Backend:** Express.js, Socket.IO for real-time events
- **Database:** MongoDB (Mongoose)
- **Chess Logic:** Chess.js and Chessground for UI
- **Styling:** Tailwind CSS, Framer Motion, Lucide Icons

---

## Getting Started

### Prerequisites

- Node.js (version 20 or higher recommended)
- MongoDB (local or cloud)

### Installation

Clone the repository:

```bash
git clone https://github.com/Sandblaze05/pixel-chess.git
cd pixel-chess
```

Install dependencies for both frontend and backend:

```bash
npm install
cd backend
npm install
```

Set up environment variables in `.env.local` for Next.js and `.env` for Express backend:

```
# .env.local (Frontend)
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
MONGODB_URI=your_mongodb_connection_uri

# .env (Backend)
PORT=3001
MONGODB_URI=your_mongodb_connection_uri
```

### Running the Application

Start the backend server:

```bash
cd backend
node src/index.js
```

Start the frontend (Next.js):

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use Pixel Chess.

---

## Backend API & Socket Events

### Socket Connection Setup

```javascript
import io from 'socket.io-client';

const socket = io('your-server-url', {
  auth: { email }
});
```

### Events You Can Emit (Frontend → Backend)

- **Queue Management**
  - `joinQueue` `{ mode: 'rapid' | 'blitz' | 'bullet' }`
  - `leaveQueue` `{ mode }`
- **Game Actions**
  - `makeMove` `{ gameId, move }`
  - `joinGame` `{ gameId }`
  - `resign` `{ gameId }`
  - `requestDraw` `{ gameId }`
  - `respondToDraw` `{ gameId, accept }`
- **Chat & Info**
  - `sendMessage` `{ gameId, message }`
  - `getActiveGames`

### Events Client Listens For (Backend → Frontend)

- `connected`: Authentication and user info
- `error`: Error messages
- `queueJoined`, `queueLeft`: Queue management
- `gameStart`: Game initialization (see backend/README.md for full data structure)
- `moveMade`: Move updates (FEN string, SAN move, timers)
- `timeUpdate`: Real-time time updates
- `invalidMove`: Invalid move errors
- `gameOver`: Game result (winner, reason, final position)
- `drawOffered`, `drawDeclined`: Draw offer management
- `gameJoined`: Rejoin game state
- `messageReceived`: Chat messages
- `activeGames`: List of user’s ongoing games

### Example State Management Class

See `backend/README.md` for a sample `ChessGameManager` class that connects to the backend, manages game state, and listens for events.

---

## Error Handling

Common error cases to handle in UI:

- Authentication failures
- Invalid moves
- Network disconnections
- Game not found
- Permission errors

---

## Time Management

The backend sends time updates every second during active games.

---

## Project Structure

- `/app` – Next.js frontend
- `/components` – React components (Chessboard, etc.)
- `/backend` – Express backend with Socket.IO
- `/models` – Mongoose models
- `/lib` – Utilities and database connection
- `backend/README.md` – Backend event and API documentation

---

## License

This project is licensed under the MIT License.

---

