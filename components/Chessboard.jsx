"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import { Chess } from 'chess.js';

const ChessBoard = ({
  gameState,
  onMoveMade,
  playerColor = "white",
  isPlayerTurn = true, // We'll calculate this internally instead
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
  const lastSyncedFenRef = useRef('');
  const [awaitingServerResponse, setAwaitingServerResponse] = useState(false);

  // Calculate if it's actually the player's turn based on the position
  const isActuallyPlayerTurn = () => {
    if (awaitingServerResponse) return false; // Block moves while waiting for server
    
    const currentTurn = gameRef.current.turn(); // 'w' or 'b'
    const playerTurn = playerColor === 'white' ? 'w' : 'b';
    
    const result = currentTurn === playerTurn;
    console.log('Turn check:', {
      currentTurn,
      playerColor,
      playerTurn,
      isPlayerTurn: result,
      awaitingServer: awaitingServerResponse,
      externalIsPlayerTurn: isPlayerTurn // for comparison
    });
    
    return result;
  };

  // Force sync Chess.js with external state
  const forceSync = (externalFen) => {
    if (!externalFen || externalFen === lastSyncedFenRef.current) {
      return false;
    }

    console.log('Force syncing to FEN:', externalFen);
    
    try {
      const newGame = new Chess(externalFen);
      gameRef.current = newGame;
      lastSyncedFenRef.current = externalFen;
      
      // Clear server wait when we get a new position
      setAwaitingServerResponse(false);
      
      console.log('Sync successful:', {
        fen: externalFen,
        turn: newGame.turn(),
        moveCount: newGame.moveNumber(),
        isNowPlayerTurn: isActuallyPlayerTurn()
      });
      
      return true;
    } catch (error) {
      console.error("Failed to sync with FEN:", error);
      return false;
    }
  };

  // Get all legal moves
  const getAllLegalMoves = () => {
    try {
      const moves = gameRef.current.moves({ verbose: true });
      const dests = new Map();
      
      moves.forEach(move => {
        if (!dests.has(move.from)) {
          dests.set(move.from, []);
        }
        dests.get(move.from).push(move.to);
      });
      
      return dests;
    } catch (error) {
      console.error('Error getting legal moves:', error);
      return new Map();
    }
  };

  // Initialize and sync with external game state
  useEffect(() => {
    console.log('=== Game State Update ===', {
      newFen: gameState?.fen,
      lastSynced: lastSyncedFenRef.current,
      currentFen: gameRef.current?.fen(),
      moveCount: gameState?.moves?.length,
      externalIsPlayerTurn: isPlayerTurn
    });
    
    if (gameState?.fen) {
      const synced = forceSync(gameState.fen);
      if (synced) {
        // Force a board update when we sync a new position
        updateChessground();
      }
    }
  }, [gameState?.fen]);

  // Update Chessground display
  const updateChessground = () => {
    if (!chessgroundRef.current || !gameRef.current) return;

    const currentGame = gameRef.current;
    const currentFen = currentGame.fen();
    const playerCanMove = isActuallyPlayerTurn();
    
    console.log('Updating Chessground:', {
      fen: currentFen,
      turn: currentGame.turn(),
      playerCanMove: playerCanMove ? playerColor : 'none',
      awaitingServer: awaitingServerResponse
    });

    chessgroundRef.current.set({
      fen: currentFen,
      turnColor: currentGame.turn() === 'w' ? 'white' : 'black',
      check: currentGame.inCheck(),
      movable: {
        color: playerCanMove ? playerColor : undefined,
        dests: playerCanMove ? getAllLegalMoves() : new Map(),
      },
    });

    // Show last move highlight
    if (gameState?.moves && gameState.moves.length > 0) {
      const history = currentGame.history({ verbose: true });
      if (history.length > 0) {
        const lastMove = history[history.length - 1];
        chessgroundRef.current.set({
          lastMove: [lastMove.from, lastMove.to],
        });
      }
    }

    // Clear selection when not player's turn
    if (!playerCanMove) {
      setSelectedSquare(null);
    }
  };

  // Initialize Chessground
  useEffect(() => {
    if (!boardRef.current || chessgroundRef.current) return;

    console.log('Initializing Chessground');

    const config = {
      fen: gameRef.current.fen(),
      orientation: playerColor,
      turnColor: gameRef.current.turn() === 'w' ? 'white' : 'black',
      coordinates: showCoordinates,
      movable: {
        free: false,
        color: isActuallyPlayerTurn() ? playerColor : undefined,
        dests: getAllLegalMoves(),
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
        duration: 150,
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

  // Update board when relevant props change
  useEffect(() => {
    updateChessground();
  }, [gameState, playerColor, awaitingServerResponse]);

  // Handle square clicks
  const handleSquareSelect = (square) => {
    console.log('Square selected:', square, { 
      playerCanMove: isActuallyPlayerTurn(),
      awaitingServer: awaitingServerResponse 
    });
    
    if (!isActuallyPlayerTurn()) return;

    const piece = gameRef.current.get(square);
    const currentPlayerColor = playerColor === 'white' ? 'w' : 'b';

    if (selectedSquare && selectedSquare !== square) {
      // Attempt move
      if (attemptMove(selectedSquare, square)) {
        setSelectedSquare(null);
        return;
      }
    }

    // Select piece if it belongs to current player
    if (piece && piece.color === currentPlayerColor) {
      setSelectedSquare(square);
      
      // Show only moves for this piece
      const moves = gameRef.current.moves({ square, verbose: true });
      const destinations = moves.map(move => move.to);
      
      chessgroundRef.current.set({
        movable: {
          color: playerColor,
          dests: new Map([[square, destinations]]),
        },
      });
    } else {
      setSelectedSquare(null);
      chessgroundRef.current.set({
        movable: {
          color: isActuallyPlayerTurn() ? playerColor : undefined,
          dests: getAllLegalMoves(),
        },
      });
    }
  };

  // Handle drag moves
  const handleMove = (from, to) => {
    console.log('Drag move:', { 
      from, 
      to, 
      playerCanMove: isActuallyPlayerTurn(),
      awaitingServer: awaitingServerResponse
    });
    
    if (isActuallyPlayerTurn()) {
      attemptMove(from, to);
    }
  };

  // Attempt to make a move
  const attemptMove = (from, to) => {
    if (!isActuallyPlayerTurn()) {
      console.log('Move rejected: not player turn or awaiting server');
      return false;
    }

    // Use Chess.js to validate the move
    const testGame = new Chess(gameRef.current.fen());
    
    try {
      // Test the move first
      const testMove = testGame.move({ from, to, promotion: 'q' });
      if (!testMove) {
        console.log('Invalid move according to Chess.js');
        return false;
      }
      
      // Check if it's a promotion move
      const piece = gameRef.current.get(from);
      const toRank = parseInt(to[1]);
      
      if (piece?.type === 'p' && (toRank === 8 || toRank === 1)) {
        setPromotionMove({ from, to });
        setShowPromotionDialog(true);
        return true;
      }

      return executeMove(from, to);
      
    } catch (error) {
      console.log('Move validation failed:', error);
      return false;
    }
  };

  // Execute the move after validation
  const executeMove = (from, to, promotion = 'q') => {
    try {
      const move = gameRef.current.move({
        from,
        to,
        promotion: promotion.toLowerCase(),
      });

      if (move) {
        console.log('Move executed:', move.san);
        
        // Mark that we're waiting for server confirmation
        setAwaitingServerResponse(true);
        
        // Update our tracking
        lastSyncedFenRef.current = gameRef.current.fen();
        
        // Play sound
        if (enableSounds) {
          playMoveSound(move);
        }

        // Immediately update Chessground with new position
        chessgroundRef.current.set({
          fen: gameRef.current.fen(),
          turnColor: gameRef.current.turn() === 'w' ? 'white' : 'black',
          check: gameRef.current.inCheck(),
          lastMove: [from, to],
          movable: {
            color: undefined, // Disable until server confirms
            dests: new Map(),
          },
        });

        // Notify parent
        onMoveMade?.(move.san);

        // Check game end
        if (gameRef.current.isGameOver()) {
          setTimeout(() => {
            let reason = 'draw';
            if (gameRef.current.isCheckmate()) reason = 'checkmate';
            else if (gameRef.current.isStalemate()) reason = 'stalemate';
            else if (gameRef.current.isInsufficientMaterial()) reason = 'insufficient_material';
            else if (gameRef.current.isThreefoldRepetition()) reason = 'repetition';
            
            onGameEnd?.(reason);
          }, 300);
        }

        return true;
      }
    } catch (error) {
      console.error("Move execution failed:", error);
      // Reset board on failure
      updateChessground();
    }

    return false;
  };

  // Simple move sound
  const playMoveSound = (move) => {
    if (!enableSounds) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = move.captured ? 400 : 800;
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.08);
    } catch (error) {
      // Ignore audio errors
    }
  };

  // Handle promotion
  const handlePromotion = (piece) => {
    if (promotionMove) {
      executeMove(promotionMove.from, promotionMove.to, piece);
      setPromotionMove(null);
      setShowPromotionDialog(false);
    }
  };

  const getPieceSymbol = (piece) => {
    const symbols = {
      q: "♛", r: "♜", b: "♝", n: "♞",
      Q: "♕", R: "♖", B: "♗", N: "♘",
    };
    return symbols[piece] || "";
  };

  return (
    <div className="flex flex-col items-center gap-4 relative">
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 font-mono bg-gray-800 p-2 rounded">
          Turn: {gameRef.current?.turn()} | Player: {playerColor} | 
          Can Move: {isActuallyPlayerTurn() ? 'YES' : 'NO'} | 
          Awaiting: {awaitingServerResponse ? 'YES' : 'NO'}
        </div>
      )}
      
      <div className="relative">
        <div
          ref={boardRef}
          className="chessground-board rounded-lg shadow-2xl overflow-hidden"
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

      <style jsx>{`
        .chessground-board {
          --cg-coord-color: rgba(255, 255, 255, 0.8);
          --cg-coord-font: 'Arial', sans-serif;
        }
        
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
        
        .chessground-board cg-board square.move-dest {
          background: radial-gradient(circle, rgba(20, 85, 30, 0.5) 22%, transparent 22%);
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