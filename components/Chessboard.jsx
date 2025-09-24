"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Chess } from "chess.js";
import { RotateCcw, Flag, Crown, Settings, Volume2, VolumeX } from "lucide-react";

const ChessBoard = ({
  gameState,
  onMoveMade,
  playerColor = "white",
  isPlayerTurn = true,
  customPieces = null, // Object with piece symbols or image URLs
  boardTheme = "classic", // classic, green, blue, wood
  showCoordinates = true,
  enableSounds = true,
  onGameEnd = null,
  onOfferDraw = null,
  onResign = null,
}) => {
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [checkSquare, setCheckSquare] = useState(null);
  const [promotionSquare, setPromotionSquare] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(enableSounds);
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
  const [moveHistory, setMoveHistory] = useState([]);
  const boardRef = useRef(null);
  const audioRef = useRef(null);

  // Board themes
  const themes = {
    classic: {
      light: "bg-amber-100",
      dark: "bg-amber-800",
      border: "border-amber-900",
    },
    green: {
      light: "bg-emerald-100",
      dark: "bg-emerald-700",
      border: "border-emerald-900",
    },
    blue: {
      light: "bg-blue-100",
      dark: "bg-blue-700",
      border: "border-blue-900",
    },
    wood: {
      light: "bg-yellow-100",
      dark: "bg-yellow-800",
      border: "border-yellow-900",
    },
  };

  const currentTheme = themes[boardTheme] || themes.classic;

  // Update captured pieces
  const updateCapturedPieces = useCallback((chess) => {
    const initialPieces = {
      white: ['P','P','P','P','P','P','P','P','R','N','B','Q','K','B','N','R'],
      black: ['p','p','p','p','p','p','p','p','r','n','b','q','k','b','n','r']
    };
    
    const currentPieces = { white: [], black: [] };
    
    // Count current pieces on board
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const square = String.fromCharCode(97 + file) + (rank + 1);
        const piece = chess.get(square);
        if (piece) {
          if (piece.color === 'w') {
            currentPieces.white.push(piece.type.toUpperCase());
          } else {
            currentPieces.black.push(piece.type);
          }
        }
      }
    }
    
    // Calculate captured pieces
    const captured = { white: [], black: [] };
    
    // White captured pieces (pieces missing from black)
    const blackCopy = [...initialPieces.black];
    currentPieces.black.forEach(piece => {
      const index = blackCopy.indexOf(piece);
      if (index > -1) blackCopy.splice(index, 1);
    });
    captured.white = blackCopy;
    
    // Black captured pieces (pieces missing from white)
    const whiteCopy = [...initialPieces.white];
    currentPieces.white.forEach(piece => {
      const index = whiteCopy.indexOf(piece);
      if (index > -1) whiteCopy.splice(index, 1);
    });
    captured.black = whiteCopy;
    
    setCapturedPieces(captured);
  }, []);

  // Find king square
  const findKingSquare = useCallback((chess, color) => {
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const square = String.fromCharCode(97 + file) + (rank + 1);
        const piece = chess.get(square);
        if (piece && piece.type === 'k' && piece.color === color) {
          return square;
        }
      }
    }
    return null;
  }, []);

  // Update game when gameState changes
  const game = useMemo(() => {
    if (!gameState?.fen) {
      return new Chess();
    }
    try {
      const chess = new Chess(gameState.fen);
      
      // Update move history
      if (gameState.moves) {
        setMoveHistory(gameState.moves);
      }
      
      // Update captured pieces
      updateCapturedPieces(chess);
      
      // Check for check
      if (chess.inCheck()) {
        const kingSquare = findKingSquare(chess, chess.turn());
        setCheckSquare(kingSquare);
      } else {
        setCheckSquare(null);
      }
      
      return chess;
    } catch (error) {
      console.error("Invalid FEN provided in props:", error);
      return new Chess();
    }
  }, [gameState?.fen, gameState?.moves, updateCapturedPieces, findKingSquare]);

  // Play sound effect
  const playSound = (type) => {
    if (!soundEnabled) return;
    
    // Create audio context for different sounds
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'move':
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        break;
      case 'capture':
        oscillator.frequency.value = 400;
        gainNode.gain.value = 0.15;
        break;
      case 'check':
        oscillator.frequency.value = 1000;
        gainNode.gain.value = 0.2;
        break;
      case 'castle':
        oscillator.frequency.value = 600;
        gainNode.gain.value = 0.1;
        break;
      default:
        oscillator.frequency.value = 500;
        gainNode.gain.value = 0.1;
    }
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  // Get piece symbol for display
  const getPieceSymbol = (piece) => {
    if (customPieces && customPieces[piece]) {
      // Check if it's an image URL or a symbol
      if (customPieces[piece].startsWith('http') || customPieces[piece].startsWith('data:')) {
        return <img src={customPieces[piece]} alt={piece} className="w-full h-full object-contain" />;
      }
      return customPieces[piece];
    }
    
    const symbols = {
      p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
      P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔",
    };
    return symbols[piece] || "";
  };

  // Convert square notation to coordinates
  const squareToCoords = (square) => {
    const file = square.charCodeAt(0) - 97;
    const rank = parseInt(square[1]) - 1;
    return playerColor === "white" ? [file, 7 - rank] : [7 - file, rank];
  };

  // Convert coordinates to square notation
  const coordsToSquare = (col, row) => {
    if (playerColor === "white") {
      return String.fromCharCode(97 + col) + (8 - row);
    } else {
      return String.fromCharCode(97 + (7 - col)) + (row + 1);
    }
  };

  // Check if piece can be dragged
  const canDragPiece = (piece, square) => {
    if (!piece || !isPlayerTurn) return false;
    
    const isCorrectColor =
      (piece.color === "w" && playerColor === "white") ||
      (piece.color === "b" && playerColor === "black");
    
    return isCorrectColor;
  };

  // Handle promotion
  const handlePromotion = (from, to, promotionPiece = 'q') => {
    const gameCopy = new Chess(game.fen());
    
    try {
      const move = gameCopy.move({
        from: from,
        to: to,
        promotion: promotionPiece,
      });
      
      if (move) {
        setLastMove({ from, to });
        
        // Play appropriate sound
        if (move.captured) {
          playSound('capture');
        } else if (move.san.includes('+')) {
          playSound('check');
        } else if (move.san.includes('O-O')) {
          playSound('castle');
        } else {
          playSound('move');
        }
        
        onMoveMade?.(move.san);
        return true;
      }
    } catch (error) {
      console.error("Promotion error:", error);
    }
    
    return false;
  };

  // Make move
  const makeMove = useCallback((from, to, promotion = null) => {
    if (!isPlayerTurn || game.isGameOver()) return false;
    
    const gameCopy = new Chess(game.fen());
    
    // Check if this is a pawn promotion
    const piece = gameCopy.get(from);
    const toRank = parseInt(to[1]);
    
    if (piece?.type === 'p' && (toRank === 8 || toRank === 1)) {
      if (promotion) {
        return handlePromotion(from, to, promotion);
      } else {
        // Show promotion dialog
        setPromotionSquare({ from, to });
        return false;
      }
    }
    
    try {
      const move = gameCopy.move({ from, to });
      
      if (move) {
        setLastMove({ from, to });
        
        // Play appropriate sound
        if (move.captured) {
          playSound('capture');
        } else if (move.san.includes('+')) {
          playSound('check');
        } else if (move.san.includes('O-O')) {
          playSound('castle');
        } else {
          playSound('move');
        }
        
        onMoveMade?.(move.san);
        
        // Check for game end
        if (gameCopy.isGameOver()) {
          setTimeout(() => {
            onGameEnd?.(gameCopy.isCheckmate() ? 'checkmate' : 
                      gameCopy.isStalemate() ? 'stalemate' : 
                      gameCopy.isInsufficientMaterial() ? 'insufficient_material' : 
                      gameCopy.isThreefoldRepetition() ? 'repetition' : 'draw');
          }, 500);
        }
        
        return true;
      }
    } catch (error) {
      console.error("Move error:", error);
    }
    
    return false;
  }, [game, isPlayerTurn, onMoveMade, onGameEnd]);

  // Get valid moves for highlighting
  const getValidMoves = (square) => {
    try {
      const moves = game.moves({ square, verbose: true });
      return moves.map((move) => move.to);
    } catch {
      return [];
    }
  };

  // Handle mouse down on piece
  const handleMouseDown = (e, col, row) => {
    const square = coordsToSquare(col, row);
    const piece = game.get(square);

    if (!piece || !canDragPiece(piece, square)) return;

    setDraggedPiece(piece);
    setDraggedFrom(square);
    setSelectedSquare(square);
    setHighlightedSquares(getValidMoves(square));

    e.preventDefault();
  };

  // Handle mouse up (drop)
  const handleMouseUp = (e, col, row) => {
    if (!draggedFrom || !draggedPiece) return;

    const targetSquare = coordsToSquare(col, row);

    if (draggedFrom !== targetSquare) {
      makeMove(draggedFrom, targetSquare);
    }

    // Clear drag state
    setDraggedPiece(null);
    setDraggedFrom(null);
    setSelectedSquare(null);
    setHighlightedSquares([]);
  };

  // Handle click (for mobile or click-to-move)
  const handleClick = (e, col, row) => {
    const square = coordsToSquare(col, row);
    const piece = game.get(square);

    if (selectedSquare) {
      if (selectedSquare !== square) {
        makeMove(selectedSquare, square);
      }
      setSelectedSquare(null);
      setHighlightedSquares([]);
    } else if (piece && canDragPiece(piece, square)) {
      setSelectedSquare(square);
      setHighlightedSquares(getValidMoves(square));
    }
  };

  // Get coordinate label
  const getCoordinateLabel = (index, isFile = true) => {
    if (isFile) {
      return playerColor === "white" 
        ? String.fromCharCode(97 + index) 
        : String.fromCharCode(97 + (7 - index));
    } else {
      return playerColor === "white" ? (8 - index).toString() : (index + 1).toString();
    }
  };

  // Render promotion dialog
  const renderPromotionDialog = () => {
    if (!promotionSquare) return null;
    
    const pieces = playerColor === 'white' ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n'];
    
    return (
      <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 rounded-lg p-4">
        <div className="bg-slate-800 p-4 sm:p-6 rounded-lg border border-cyan-500/30 max-w-sm w-full">
          <h3 className="text-white text-base sm:text-lg font-bold mb-3 sm:mb-4 text-center">Choose Promotion</h3>
          <div className="flex gap-2 sm:gap-4 justify-center">
            {pieces.map((piece) => (
              <button
                key={piece}
                onClick={() => {
                  handlePromotion(promotionSquare.from, promotionSquare.to, piece.toLowerCase());
                  setPromotionSquare(null);
                }}
                className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-100 rounded-lg flex items-center justify-center text-2xl sm:text-3xl hover:bg-amber-200 transition-colors touch-manipulation"
              >
                {getPieceSymbol(piece)}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render captured pieces
  const renderCapturedPieces = (color) => {
    const pieces = capturedPieces[color] || [];
    if (pieces.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-0.5 sm:gap-1 min-h-[16px] sm:min-h-[24px]">
        {pieces.map((piece, index) => (
          <span key={index} className="text-sm sm:text-lg opacity-70">
            {getPieceSymbol(piece)}
          </span>
        ))}
      </div>
    );
  };

  // Render the board
  const renderBoard = () => {
    const squares = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = coordsToSquare(col, row);
        const piece = game.get(square);
        const isLight = (row + col) % 2 === 0;
        const isHighlighted = highlightedSquares.includes(square);
        const isSelected = selectedSquare === square;
        const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
        const isInCheck = checkSquare === square;

        squares.push(
          <div
            key={`${col}-${row}`}
            className={`
              w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center cursor-pointer select-none relative
              ${isLight ? currentTheme.light : currentTheme.dark}
              ${isHighlighted ? "ring-1 sm:ring-2 ring-green-400" : ""}
              ${isSelected ? "ring-1 sm:ring-2 ring-blue-400" : ""}
              ${isLastMove ? "ring-1 sm:ring-2 ring-yellow-400" : ""}
              ${isInCheck ? "ring-1 sm:ring-2 ring-red-500 bg-red-200" : ""}
              hover:brightness-110 transition-all touch-manipulation
            `}
            onMouseDown={(e) => handleMouseDown(e, col, row)}
            onMouseUp={(e) => handleMouseUp(e, col, row)}
            onClick={(e) => handleClick(e, col, row)}
          >
            {/* Coordinate labels */}
            {showCoordinates && col === 0 && (
              <span className={`absolute top-0.5 left-0.5 text-[0.5rem] xs:text-xs font-bold ${isLight ? 'text-amber-800' : 'text-amber-100'} hidden xs:block`}>
                {getCoordinateLabel(row, false)}
              </span>
            )}
            {showCoordinates && row === 7 && (
              <span className={`absolute bottom-0.5 right-0.5 text-[0.5rem] xs:text-xs font-bold ${isLight ? 'text-amber-800' : 'text-amber-100'} hidden xs:block`}>
                {getCoordinateLabel(col, true)}
              </span>
            )}
            
            {/* Piece rendering with absolute positioning to prevent layout shift */}
            <div className="absolute inset-0 flex items-center justify-center">
              {piece && (
                <div
                  className={`
                    text-sm xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl
                    ${piece.color === "w" ? "text-white" : "text-black"}
                    ${draggedFrom === square ? "opacity-50" : ""}
                    filter drop-shadow-sm flex items-center justify-center leading-none
                  `}
                  style={{
                    textShadow:
                      piece.color === "w"
                        ? "1px 1px 1px black"
                        : "1px 1px 1px white",
                  }}
                >
                  {getPieceSymbol(piece.type.toUpperCase())}
                </div>
              )}
            </div>
            
            {/* Move indicators */}
            {isHighlighted && !piece && (
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full opacity-60 absolute"></div>
            )}
            {isHighlighted && piece && (
              <div className="absolute inset-0.5 sm:inset-1 border border-green-400 sm:border-2 rounded-full opacity-60"></div>
            )}
          </div>
        );
      }
    }

    return squares;
  };

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-4 p-2 sm:p-4 min-h-screen justify-center">
      {/* Opponent Info & Captured Pieces */}
      {gameState?.opponent && (
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
          <div className="flex items-center justify-between p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-cyan-500/20 mb-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs sm:text-sm font-bold">
                  {gameState.opponent.username?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-white font-medium text-xs sm:text-sm truncate">
                  {gameState.opponent.username}
                </div>
                <div className="text-cyan-300 text-xs hidden sm:block">
                  Rating: {gameState.opponent.rating}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs text-cyan-300">
                {playerColor === "white" ? "Black" : "White"}
              </div>
              <div className="text-white font-mono text-xs sm:text-sm">
                {gameState.timeRemaining
                  ? `${Math.floor((playerColor === "white" ? gameState.timeRemaining.black : gameState.timeRemaining.white) / 60000)}:${String(Math.floor(((playerColor === "white" ? gameState.timeRemaining.black : gameState.timeRemaining.white) % 60000) / 1000)).padStart(2, "0")}`
                  : "10:00"}
              </div>
            </div>
          </div>
          <div className="px-2 sm:px-3">
            {renderCapturedPieces(playerColor === "white" ? "white" : "black")}
          </div>
        </div>
      )}

      {/* Chess Board */}
      <div className="relative">
        <div
          ref={boardRef}
          className={`grid grid-cols-8 border-2 sm:border-4 ${currentTheme.border} rounded-lg shadow-2xl ${currentTheme.dark} max-w-fit mx-auto`}
          style={{ userSelect: "none" }}
        >
          {renderBoard()}
        </div>

        {/* Promotion Dialog */}
        {renderPromotionDialog()}

        {/* Game Status Overlay */}
        {gameState?.gameStatus === "finished" && (
          <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center p-4">
            <div className="text-center p-4 sm:p-6 bg-slate-900/90 rounded-lg border border-cyan-500/30 max-w-sm w-full">
              <h3 className="text-white text-lg sm:text-xl font-bold mb-2">Game Over</h3>
              <p className="text-cyan-200 text-sm sm:text-base">
                {gameState.winner ? `${gameState.winner} wins!` : "Draw"}
              </p>
            </div>
          </div>
        )}

        {!isPlayerTurn && gameState?.gameStatus === "playing" && (
          <div className="absolute top-1 sm:top-2 left-1 sm:left-2 px-2 sm:px-3 py-1 bg-orange-500/80 text-white text-xs sm:text-sm rounded-full">
            <span className="hidden xs:inline">Opponent's </span>Turn
          </div>
        )}

        {/* Game Controls */}
        <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex gap-1 sm:gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 sm:p-2 bg-slate-800/80 text-white rounded-full hover:bg-slate-700/80 transition-colors touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
          >
            {soundEnabled ? <Volume2 size={14} className="sm:w-4 sm:h-4" /> : <VolumeX size={14} className="sm:w-4 sm:h-4" />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 sm:p-2 bg-slate-800/80 text-white rounded-full hover:bg-slate-700/80 transition-colors touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
          >
            <Settings size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Your Info & Captured Pieces */}
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
        <div className="px-2 sm:px-3 mb-2">
          {renderCapturedPieces(playerColor === "white" ? "black" : "white")}
        </div>
        <div className="flex items-center justify-between p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-cyan-500/20">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs sm:text-sm font-bold">You</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white font-medium text-xs sm:text-sm">You</div>
              <div className="text-cyan-300 text-xs hidden sm:block">
                Playing as {playerColor}
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-cyan-300">Your time</div>
            <div className="text-white font-mono text-xs sm:text-sm">
              {gameState?.timeRemaining
                ? `${Math.floor((playerColor === "white" ? gameState.timeRemaining.white : gameState.timeRemaining.black) / 60000)}:${String(Math.floor(((playerColor === "white" ? gameState.timeRemaining.white : gameState.timeRemaining.black) % 60000) / 1000)).padStart(2, "0")}`
                : "10:00"}
            </div>
          </div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-4 justify-center">
        {onOfferDraw && (
          <button
            onClick={onOfferDraw}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center gap-1 sm:gap-2 text-sm touch-manipulation min-h-[44px]"
          >
            <Crown size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Offer </span>Draw
          </button>
        )}
        {onResign && (
          <button
            onClick={onResign}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-1 sm:gap-2 text-sm touch-manipulation min-h-[44px]"
          >
            <Flag size={14} className="sm:w-4 sm:h-4" />
            Resign
          </button>
        )}
      </div>

      {/* Move History */}
      {/* {moveHistory && moveHistory.length > 0 && (
        <div className="w-full max-w-lg p-3 bg-slate-800/50 rounded-lg border border-cyan-500/20">
          <h4 className="text-white font-medium text-sm mb-2">Move History</h4>
          <div className="max-h-32 overflow-y-auto">
            <div className="grid grid-cols-4 gap-2 text-xs">
              {moveHistory.map((move, index) => (
                <div key={index} className={`text-cyan-200 ${index === moveHistory.length - 1 ? 'font-bold' : ''}`}>
                  {index % 2 === 0 && <span className="text-cyan-400">{Math.ceil((index + 1) / 2)}.</span>} {move}
                </div>
              ))}
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ChessBoard;