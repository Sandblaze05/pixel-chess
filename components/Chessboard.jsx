"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import { Chess } from 'chess.js';

const ChessBoard = ({
  gameState,
  onMoveMade,
  playerColor = "white",
  isPlayerTurn = true,
  boardTheme = "blue",
  showCoordinates = true,
  enableSounds = true,
  onGameEnd = null,
  onOfferDraw = null,
  onResign = null,
}) => {
  const boardRef = useRef(null);
  const chessgroundRef = useRef(null);
  const gameRef = useRef(new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [promotionMove, setPromotionMove] = useState(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);

  // Initialize game from gameState
  useEffect(() => {
    if (gameState?.fen) {
      try {
        gameRef.current = new Chess(gameState.fen);
      } catch (error) {
        console.error("Invalid FEN:", error);
        gameRef.current = new Chess();
      }
    } else {
      gameRef.current = new Chess();
    }
  }, [gameState?.fen]);

  // Initialize Chessground
  useEffect(() => {
    if (!boardRef.current || chessgroundRef.current) return;

    const config = {
      fen: gameRef.current.fen(),
      orientation: playerColor,
      turnColor: gameRef.current.turn() === 'w' ? 'white' : 'black',
      check: gameRef.current.inCheck(),
      coordinates: showCoordinates,
      movable: {
        free: false,
        color: isPlayerTurn ? playerColor : undefined,
        dests: getValidMoves(),
        events: {
          after: handleMove,
        },
      },
      premovable: {
        enabled: false,
      },
      predroppable: {
        enabled: false,
      },
      draggable: {
        enabled: true,
        showGhost: true,
      },
      selectable: {
        enabled: true,
      },
      events: {
        select: handleSquareSelect,
      },
      drawable: {
        enabled: true,
        visible: true,
      },
      highlight: {
        lastMove: true,
        check: true,
      },
      animation: {
        enabled: true,
        duration: 200,
      },
    };

    chessgroundRef.current = Chessground(boardRef.current, config);

    return () => {
      if (chessgroundRef.current) {
        chessgroundRef.current.destroy();
        chessgroundRef.current = null;
      }
    };
  }, []);

  // Update board when game state changes
  useEffect(() => {
    if (!chessgroundRef.current) return;

    const game = gameRef.current;
    
    chessgroundRef.current.set({
      fen: game.fen(),
      turnColor: game.turn() === 'w' ? 'white' : 'black',
      check: game.inCheck(),
      movable: {
        color: isPlayerTurn ? playerColor : undefined,
        dests: getValidMoves(),
      },
    });

    // Highlight last move
    if (gameState?.moves && gameState.moves.length > 0) {
      const lastMove = gameState.moves[gameState.moves.length - 1];
      if (lastMove.from && lastMove.to) {
        chessgroundRef.current.set({
          lastMove: [lastMove.from, lastMove.to],
        });
      }
    }
  }, [gameState, isPlayerTurn, playerColor]);

  // Get valid moves for current position
  const getValidMoves = () => {
    const game = gameRef.current;
    const dests = new Map();
    
    const moves = game.moves({ verbose: true });
    
    for (const move of moves) {
      if (!dests.has(move.from)) {
        dests.set(move.from, []);
      }
      dests.get(move.from).push(move.to);
    }
    
    return dests;
  };

  // Handle square selection (for click-to-move)
  const handleSquareSelect = (square) => {
    if (!isPlayerTurn) return;

    const game = gameRef.current;
    const piece = game.get(square);

    if (selectedSquare && selectedSquare !== square) {
      // Try to make a move
      const moveAttempt = tryMove(selectedSquare, square);
      if (moveAttempt) {
        setSelectedSquare(null);
        return;
      }
    }

    // Select new square if it has a piece of the current player
    if (piece && piece.color === (playerColor === 'white' ? 'w' : 'b')) {
      setSelectedSquare(square);
      
      // Highlight possible moves
      const moves = game.moves({ square, verbose: true });
      const destinations = moves.map(move => move.to);
      
      chessgroundRef.current.set({
        movable: {
          dests: new Map([[square, destinations]]),
        },
      });
    } else {
      setSelectedSquare(null);
      chessgroundRef.current.set({
        movable: {
          dests: getValidMoves(),
        },
      });
    }
  };

  // Handle move via drag and drop
  const handleMove = (orig, dest) => {
    tryMove(orig, dest);
  };

  // Try to make a move
  const tryMove = (from, to) => {
    if (!isPlayerTurn) return false;

    const game = gameRef.current;
    
    // Check if this is a pawn promotion
    const piece = game.get(from);
    const toRank = parseInt(to[1]);
    
    if (piece?.type === 'p' && (toRank === 8 || toRank === 1)) {
      // Show promotion dialog
      setPromotionMove({ from, to });
      setShowPromotionDialog(true);
      return false;
    }

    return makeMove(from, to);
  };

  // Make the actual move
  const makeMove = (from, to, promotion = 'q') => {
    const game = gameRef.current;
    
    try {
      const move = game.move({
        from,
        to,
        promotion: promotion.toLowerCase(),
      });

      if (move) {
        // Play sound
        if (enableSounds) {
          playMoveSound(move);
        }

        // Update Chessground
        chessgroundRef.current.set({
          fen: game.fen(),
          turnColor: game.turn() === 'w' ? 'white' : 'black',
          check: game.inCheck(),
          lastMove: [from, to],
          movable: {
            color: undefined, // Disable moves until next turn
            dests: new Map(),
          },
        });

        // Notify parent component
        onMoveMade?.(move.san);

        // Check for game end
        if (game.isGameOver()) {
          setTimeout(() => {
            let reason = 'draw';
            if (game.isCheckmate()) reason = 'checkmate';
            else if (game.isStalemate()) reason = 'stalemate';
            else if (game.isInsufficientMaterial()) reason = 'insufficient_material';
            else if (game.isThreefoldRepetition()) reason = 'repetition';
            
            onGameEnd?.(reason);
          }, 500);
        }

        return true;
      }
    } catch (error) {
      console.error("Invalid move:", error);
    }

    return false;
  };

  // Play move sound
  const playMoveSound = (move) => {
    if (!enableSounds) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (move.captured) {
      oscillator.frequency.value = 400;
      gainNode.gain.value = 0.15;
    } else if (move.san.includes('+')) {
      oscillator.frequency.value = 1000;
      gainNode.gain.value = 0.2;
    } else if (move.san.includes('O-O')) {
      oscillator.frequency.value = 600;
      gainNode.gain.value = 0.1;
    } else {
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.1;
    }
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  // Handle promotion selection
  const handlePromotion = (piece) => {
    if (promotionMove) {
      makeMove(promotionMove.from, promotionMove.to, piece);
      setPromotionMove(null);
      setShowPromotionDialog(false);
    }
  };

  // Get piece symbol for promotion dialog
  const getPieceSymbol = (piece) => {
    const symbols = {
      q: "♛", r: "♜", b: "♝", n: "♞",
      Q: "♕", R: "♖", B: "♗", N: "♘",
    };
    return symbols[piece] || "";
  };

  return (
    <div className="flex flex-col items-center gap-4 relative">
      {/* Board Container */}
      <div className="relative">
        <div
          ref={boardRef}
          className={`chessground-board rounded-lg shadow-2xl overflow-hidden`}
          style={{
            width: 'min(80vw, 80vh, 640px)',
            height: 'min(80vw, 80vh, 640px)',
          }}
        />

        {/* Promotion Dialog */}
        {showPromotionDialog && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 rounded-lg">
            <div className="bg-slate-800 p-6 rounded-lg border border-cyan-500/30">
              <h3 className="text-white text-lg font-bold mb-4 text-center">Choose Promotion</h3>
              <div className="flex gap-4">
                {['q', 'r', 'b', 'n'].map((piece) => (
                  <button
                    key={piece}
                    onClick={() => handlePromotion(piece)}
                    className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center text-3xl hover:bg-amber-200 transition-colors"
                  >
                    {getPieceSymbol(playerColor === 'white' ? piece.toUpperCase() : piece)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState?.gameStatus === "finished" && (
          <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
            <div className="text-center p-6 bg-slate-900/90 rounded-lg border border-cyan-500/30">
              <h3 className="text-white text-xl font-bold mb-2">Game Over</h3>
              <p className="text-cyan-200">
                {gameState.winner ? `${gameState.winner} wins!` : "Draw"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Game Controls */}
      <div className="flex gap-3">
        {onOfferDraw && (
          <button
            onClick={onOfferDraw}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            Offer Draw
          </button>
        )}
        {onResign && (
          <button
            onClick={onResign}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Resign
          </button>
        )}
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .chessground-board {
          --cg-coord-color: rgba(255, 255, 255, 0.8);
          --cg-coord-font: 'Arial', sans-serif;
        }
        
        /* Board themes */
        .chessground-board cg-board square.light {
          background-color: ${boardTheme === 'blue' ? '#dee3e6' : 
                            boardTheme === 'green' ? '#f0d9b5' : 
                            boardTheme === 'brown' ? '#f0d9b5' : '#f0f0f0'};
        }
        
        .chessground-board cg-board square.dark {
          background-color: ${boardTheme === 'blue' ? '#8ca2ad' : 
                            boardTheme === 'green' ? '#b58863' : 
                            boardTheme === 'brown' ? '#b58863' : '#b58863'};
        }
        
        /* Highlight colors */
        .chessground-board cg-board square.move-dest {
          background: radial-gradient(circle, rgba(20, 85, 30, 0.5) 22%, transparent 22%);
        }
        
        .chessground-board cg-board square.premove-dest {
          background: radial-gradient(circle, rgba(20, 30, 85, 0.5) 22%, transparent 22%);
        }
        
        .chessground-board cg-board square.oc.move-dest {
          background: radial-gradient(circle, transparent 22%, rgba(20, 85, 30, 0.5) 22%);
        }
        
        .chessground-board cg-board square.last-move {
          background-color: rgba(155, 199, 0, 0.41);
        }
        
        .chessground-board cg-board square.selected {
          background-color: rgba(20, 85, 30, 0.5);
        }
        
        .chessground-board cg-board square.check {
          background-color: rgba(255, 0, 0, 0.89);
        }
      `}</style>
    </div>
  );
};

export default ChessBoard;