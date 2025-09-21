'use client'

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { Sword, Shield, Trophy, Crown, Users, Settings, BookOpen, LogOut, Menu, X, Clock, User, MessageCircle, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import ChessBoard from '@/components/Chessboard';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

class ChessGameManager {
  constructor() {
    this.socket = null;
    this.currentGame = null;
    this.gameState = {
      fen: null,
      moves: [],
      playerColor: null,
      turn: 'w',
      timeRemaining: { white: 0, black: 0 },
      gameStatus: 'waiting',
      opponent: null
    };
    this.callbacks = {};
  }

  connect(email) {
    this.socket = io(`${SERVER_URL}`, {
      auth: { email },
      transports: ['websocket']
    });
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.callbacks.onConnectionChange?.(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.callbacks.onConnectionChange?.(false);
    });

    this.socket.on('connected', (data) => {
      this.userInfo = data;
      this.callbacks.onUserInfo?.(data);
    });

    this.socket.on('queueJoined', (data) => {
      this.callbacks.onQueueJoined?.(data);
    });

    this.socket.on('queueLeft', () => {
      this.callbacks.onQueueLeft?.();
    });

    this.socket.on('gameStart', (gameData) => {
      console.log('Game started received:', gameData);
      this.currentGame = gameData.gameId;

      // Determine player color based on user ID
      const isWhitePlayer = gameData.white.id === this.userInfo?.userId;

      this.gameState = {
        ...this.gameState,
        gameId: gameData.gameId,
        fen: gameData.fen,
        playerColor: isWhitePlayer ? 'white' : 'black',
        timeRemaining: {
          white: gameData.white.time,
          black: gameData.black.time
        },
        gameStatus: 'playing',
        opponent: isWhitePlayer ? gameData.black : gameData.white,
        moves: [],
        turn: gameData.currentTurn, // Chess always starts with white
        isYourTurn: isWhitePlayer // White goes first
      };

      console.log('Updated game state:', this.gameState);
      this.callbacks.onGameStart?.(this.gameState);
    });

    this.socket.on('moveMade', (moveData) => {
      console.log('Move made received:', moveData);
      
      const updatedGameState = {
        ...this.gameState,
        fen: moveData.fen,
        moves: [...this.gameState.moves, moveData.move],
        turn: moveData.turn,
        isYourTurn: moveData.turn === this.gameState.playerColor[0], // 'w' or 'b'
        timeRemaining: moveData.timeRemaining || this.gameState.timeRemaining,
      };

      this.gameState = updatedGameState; // Update the manager's state
      
      // Pass the entire updated state object to the React component
      this.callbacks.onMoveMade?.(this.gameState);
    });

    this.socket.on('timeUpdate', (timeData) => {
      this.gameState.timeRemaining = timeData;
      this.callbacks.onTimeUpdate?.(timeData);
    });

    this.socket.on('gameOver', (result) => {
      this.gameState.gameStatus = 'finished';
      this.callbacks.onGameOver?.(result);
    });

    this.socket.on('error', (message) => {
      this.callbacks.onError?.(message);
    });

    this.socket.on('invalidMove', (error) => {
      this.callbacks.onError?.(error.error);
    });
  }

  joinQueue(mode) {
    this.socket?.emit('joinQueue', { mode });
  }

  leaveQueue(mode) {
    this.socket?.emit('leaveQueue', { mode });
  }

  makeMove(gameId, move) {
    if (gameId && this.socket) {
      this.socket.emit('makeMove', {
        gameId: gameId,
        move: move
      });
    } else {
        console.error("Socket not connected or gameId missing, cannot make move.");
    }
  }

  resign() {
    if (this.currentGame) {
      this.socket?.emit('resign', { gameId: this.currentGame });
    }
  }

  offerDraw() {
    if (this.currentGame) {
      this.socket?.emit('requestDraw', { gameId: this.currentGame });
    }
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

const Dashboard = () => {
  const { status, data: session } = useSession();
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [gameManager] = useState(() => new ChessGameManager());
  const [connectionStatus, setConnectionStatus] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [gameState, setGameState] = useState({
    status: 'idle', // 'idle', 'queuing', 'playing', 'finished'
    mode: null,
    queueInfo: null,
    currentGame: null,
    opponent: null,
    timeRemaining: { white: 0, black: 0 }
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.user?.email) return;

    // Setup callbacks
    gameManager.callbacks = {
      onConnectionChange: setConnectionStatus,
      onUserInfo: setUserInfo,
      onQueueJoined: (data) => {
        setGameState(prev => ({
          ...prev,
          status: 'queuing',
          queueInfo: data
        }));
      },
      onQueueLeft: () => {
        setGameState(prev => ({
          ...prev,
          status: 'idle',
          queueInfo: null
        }));
      },
      onGameStart: (state) => {
        console.log('Dashboard: Game started with state:', state);
        setGameState(prev => ({
          ...prev,
          status: 'playing',
          currentGame: state,
          opponent: state.opponent,
          timeRemaining: state.timeRemaining,
          isYourTurn: state.turn === state.playerColor
        }));
      },
      onMoveMade: (newCurrentGameState) => {
        console.log('Dashboard: Move made with new state:', newCurrentGameState);
        setGameState(prev => ({
          ...prev,
          currentGame: newCurrentGameState,
          timeRemaining: newCurrentGameState.timeRemaining 
        }));
      },
      onTimeUpdate: (timeData) => {
        setGameState(prev => ({
          ...prev,
          timeRemaining: timeData
        }));
      },
      onGameOver: (result) => {
        setGameState(prev => ({
          ...prev,
          status: 'finished'
        }));
        alert(`Game Over! Winner: ${result.winner || 'Draw'} - Reason: ${result.reason}`);
      },
      onError: (message) => {
        setError(message);
        setTimeout(() => setError(''), 5000);
      }
    };

    gameManager.connect(session.user.email);

    return () => {
      gameManager.disconnect();
    };
  }, [session?.user?.email]);

  const handleJoinQueue = (mode) => {
    if (gameState.status === 'queuing') {
      gameManager.leaveQueue();
    } else {
      setGameState(prev => ({ ...prev, mode }));
      gameManager.joinQueue(mode);
    }
  };

  const handleLeaveQueue = () => {
    gameManager.leaveQueue();
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (status === 'loading') {
    return (
      <div className='min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950'>
        <div className="text-cyan-400">Loading...</div>
      </div>
    );
  }

  const navItems = [
    { icon: Sword, label: 'Quick Match', action: () => handleJoinQueue('rapid') },
    { icon: Shield, label: 'Blitz Match', action: () => handleJoinQueue('blitz') },
    { icon: Trophy, label: 'Bullet Match', action: () => handleJoinQueue('bullet') },
    { icon: Users, label: 'Guild Hall', href: '/guild' },
    { icon: BookOpen, label: 'Training', href: '/training' },
  ];

  const toggleNav = () => setIsNavOpen(!isNavOpen);

  return (
    <div className='flex w-screen min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950'>
      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Button */}
      <button
        onClick={toggleNav}
        className='lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-slate-800/90 border border-cyan-500/30'
      >
        {isNavOpen ? (
          <X className='w-6 h-6 text-cyan-400' />
        ) : (
          <Menu className='w-6 h-6 text-cyan-400' />
        )}
      </button>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsNavOpen(false)}
            className='lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm'
          />
        )}
      </AnimatePresence>

      {/* Responsive Navbar */}
      <AnimatePresence>
        <motion.nav
          initial={{ x: -300 }}
          animate={{ x: isNavOpen ? 0 : -300 }}
          transition={{ type: "spring", bounce: 0.1 }}
          className={`fixed lg:relative flex flex-col w-64 min-h-full bg-slate-900/90 border-r border-cyan-500/20 backdrop-blur-sm z-40 lg:translate-x-0`}
        >
          {/* Connection Status */}
          <div className="px-4 py-2 border-b border-cyan-500/20">
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${connectionStatus ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={connectionStatus ? 'text-green-400' : 'text-red-400'}>
                {connectionStatus ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Profile Section */}
          <div className='p-4 border-b border-cyan-500/20'>
            <motion.div
              className='relative group'
              whileHover={{ scale: 1.02 }}
            >
              <div className='p-4 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30'>
                <div className='flex items-center gap-3'>
                  <div className='relative'>
                    <div className='w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center'>
                      <Crown className='w-6 h-6 text-white' />
                    </div>
                    <div className='absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-slate-900' />
                  </div>
                  <div className='overflow-hidden text-ellipsis'>
                    <h3 className='text-white font-bold text-ellipsis'>
                      {userInfo?.username || session?.user?.username || 'Player'}
                    </h3>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs text-cyan-400'>
                        ELO: {userInfo?.elo?.rapid || 1200}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation Items */}
          <div className='flex-1 py-4 space-y-2 px-2'>
            {navItems.map((item, index) => (
              <motion.button
                key={index}
                className='w-full p-3 flex items-center gap-3 text-cyan-100 hover:text-white rounded-lg hover:bg-cyan-500/10 transition-colors group disabled:opacity-50'
                whileHover={{ x: 5 }}
                onClick={item.action}
                disabled={gameState.status === 'playing'}
              >
                <div className='w-8 h-8 flex items-center justify-center rounded bg-gradient-to-br from-cyan-500/20 to-purple-500/20 group-hover:from-cyan-500/30 group-hover:to-purple-500/30'>
                  <item.icon className='w-4 h-4' />
                </div>
                <span className='text-sm font-medium'>{item.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className='p-4 border-t border-cyan-500/20 space-y-2'>
            <button className='w-full p-3 flex items-center gap-3 text-cyan-100 hover:text-white rounded-lg hover:bg-cyan-500/10 transition-colors'>
              <Settings className='w-4 h-4' />
              <span className='text-sm font-medium'>Settings</span>
            </button>
            <button className='w-full p-3 flex items-center gap-3 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors'>
              <LogOut className='w-4 h-4' />
              <span className='text-sm font-medium'>Logout</span>
            </button>
          </div>
        </motion.nav>
      </AnimatePresence>

      {/* Main Content */}
      <section className='flex-1 p-6 relative'>
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{ opacity: [0.03, 0.05, 0.03] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{
            backgroundImage: `
            linear-gradient(45deg, cyan 25%, transparent 25%),
            linear-gradient(-45deg, cyan 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, cyan 75%),
            linear-gradient(-45deg, transparent 75%, cyan 75%)
          `,
            backgroundSize: '50px 50px',
            backgroundPosition: '0 0, 0 25px, 25px -25px, -25px 0px'
          }}
        />

        <div className="relative z-10">
          {/* Game Status */}
          {gameState.status === 'queuing' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-cyan-500/30 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Looking for {gameState.mode} opponent...
                  </h3>
                  <p className="text-cyan-200">
                    Queue position: {gameState.queueInfo?.queuePosition || 1}
                  </p>
                  <p className="text-cyan-200">
                    Estimated wait: {gameState.queueInfo?.estimatedWaitTime || 10}s
                  </p>
                </div>
                <button
                  onClick={handleLeaveQueue}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-500/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {gameState.status === 'playing' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              {/* Game Controls Header */}
              <div className="mb-4 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Game in Progress</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => gameManager.offerDraw()}
                      className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded border border-yellow-500/30 text-sm"
                    >
                      Offer Draw
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to resign?')) {
                          gameManager.resign();
                        }
                      }}
                      className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded border border-red-500/30 text-sm"
                    >
                      Resign
                    </button>
                  </div>
                </div>
              </div>

              {/* Chess Board */}
              <div className="flex justify-center">
                <ChessBoard
                  gameState={gameState.currentGame}
                  onMoveMade={(move) => {
                    console.log('Dashboard: Making move:', move);
                    gameManager.makeMove(gameState.currentGame.gameId, move);
                  }}
                  playerColor={gameState.currentGame?.playerColor || 'white'}
                  isPlayerTurn={gameState.currentGame?.isYourTurn || false}
                />
              </div>
            </motion.div>
          )}

          {/* Welcome Message */}
          {gameState.status === 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <h1 className="text-4xl font-bold text-white mb-4">
                Welcome to Pixel Chess
              </h1>
              <p className="text-cyan-200 text-lg mb-8">
                Choose a game mode from the sidebar to start playing
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {[
                  { mode: 'bullet', time: '1+0', desc: 'Lightning fast games' },
                  { mode: 'blitz', time: '5+0', desc: 'Quick tactical battles' },
                  { mode: 'rapid', time: '10+0', desc: 'Thoughtful strategic play' }
                ].map((gameMode) => (
                  <motion.button
                    key={gameMode.mode}
                    onClick={() => handleJoinQueue(gameMode.mode)}
                    className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-cyan-500/30 hover:border-cyan-400/50 transition-all backdrop-blur-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Clock className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                    <h3 className="text-white font-bold text-lg capitalize mb-2">
                      {gameMode.mode}
                    </h3>
                    <p className="text-cyan-300 text-sm mb-2">{gameMode.time}</p>
                    <p className="text-cyan-200 text-xs">{gameMode.desc}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;