"use client";

import React, { useState, useMemo, useCallback, useRef } from "react";
import { Chess } from "chess.js";

const ChessBoard = ({
  gameState,
  onMoveMade,
  playerColor = "white",
  isPlayerTurn = true,
}) => {
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const boardRef = useRef(null);

  // console.log("ChessBoard Props Check:", {
  //   isPlayerTurn,
  //   playerColor,
  //   gameStatus: gameState?.gameStatus,
  //   fen: gameState?.fen,
  // });

  // Update game when gameState changes
  const game = useMemo(() => {
    if (!gameState?.fen) {
      return new Chess();
    }
    try {
      return new Chess(gameState.fen);
    } catch (error) {
      console.error("Invalid FEN provided in props:", error);
      return new Chess();
    }
  }, [gameState?.fen]);

  // Get piece symbol for display
  const getPieceSymbol = (piece) => {
    const symbols = {
      p: "♟",
      r: "♜",
      n: "♞",
      b: "♝",
      q: "♛",
      k: "♚",
      P: "♙",
      R: "♖",
      N: "♘",
      B: "♗",
      Q: "♕",
      K: "♔",
    };
    return symbols[piece] || "";
  };

  // Convert square notation to coordinates
  const squareToCoords = (square) => {
    const file = square.charCodeAt(0) - 97; // 'a' = 0, 'b' = 1, etc.
    const rank = parseInt(square[1]) - 1; // '1' = 0, '2' = 1, etc.
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
    console.log(`canDragPiece check on ${piece} at ${square}`);

    if (!piece || !isPlayerTurn) {
      console.log(`Cannot drag: piece=${piece}, isPlayerTurn=${isPlayerTurn}`);
      return false;
    }

    const isCorrectColor =
      (piece.color === "w" && playerColor === "white") ||
      (piece.color === "b" && playerColor === "black");

    console.log(
      `CanDrag result: isCorrectColor=${isCorrectColor}, piece.color=${piece.color}, playerColor=${playerColor}`
    );
    return isCorrectColor;
  };

  // Make move
  const makeMove = useCallback(
    (from, to) => {
      console.log(`--- makeMove initiated ---`);
      console.log(`Attempting move from ${from} to ${to}`);

      const gameCopy = new Chess(game.fen());
      console.log("Board FEN before move:", gameCopy.fen());

      if (!isPlayerTurn) {
        console.warn("Move rejected: Not player's turn.");
        return false;
      }

      if (gameCopy.isGameOver()) {
        console.warn("Move rejected: Game is over.");
        return false;
      }

      try {
        const move = gameCopy.move({
          from: from,
          to: to,
          promotion: "q",
        });

        console.log("Move validation result:", move);

        if (move === null) {
          console.error("Move was invalid.");
          return false;
        }

        console.log("Move was valid! Notifying parent.");
        onMoveMade?.(move.san);
        return true;
      } catch (error) {
        console.error("An error occurred during move validation:", error);
        return false;
      }
    },
    [game, isPlayerTurn, onMoveMade]
  );

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
    console.log("--- handleMouseDown ---");
    const square = coordsToSquare(col, row);
    const piece = game.get(square);

    console.log(`Mouse down on ${square}, piece:`, piece);

    if (!piece || !canDragPiece(piece, square)) {
      console.log("Cannot drag this piece");
      return;
    }

    console.log("Starting drag operation");
    setDraggedPiece(piece);
    setDraggedFrom(square);
    setSelectedSquare(square);
    setHighlightedSquares(getValidMoves(square));

    e.preventDefault();
  };

  // Handle mouse up (drop)
  const handleMouseUp = (e, col, row) => {
    console.log("--- handleMouseUp ---");

    if (!draggedFrom || !draggedPiece) {
      console.log("No drag operation in progress");
      return;
    }

    const targetSquare = coordsToSquare(col, row);
    console.log(`Dropping on ${targetSquare}`);

    if (draggedFrom !== targetSquare) {
      const success = makeMove(draggedFrom, targetSquare);
      if (!success) {
        console.log("Move was not successful, piece will stay in place");
      }
    }

    // Clear drag state
    setDraggedPiece(null);
    setDraggedFrom(null);
    setSelectedSquare(null);
    setHighlightedSquares([]);
  };

  // Handle click (for mobile or click-to-move)
  const handleClick = (e, col, row) => {
    console.log("--- handleClick ---");
    const square = coordsToSquare(col, row);
    const piece = game.get(square);

    if (selectedSquare) {
      // Second click - try to move
      if (selectedSquare !== square) {
        makeMove(selectedSquare, square);
      }
      setSelectedSquare(null);
      setHighlightedSquares([]);
    } else if (piece && canDragPiece(piece, square)) {
      // First click - select piece
      setSelectedSquare(square);
      setHighlightedSquares(getValidMoves(square));
    }
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

        squares.push(
          <div
            key={`${col}-${row}`}
            className={`
              w-12 h-12 flex items-center justify-center text-2xl cursor-pointer select-none
              ${isLight ? "bg-amber-100" : "bg-amber-800"}
              ${isHighlighted ? "ring-2 ring-green-400" : ""}
              ${isSelected ? "ring-2 ring-blue-400" : ""}
              hover:brightness-110 transition-all
            `}
            onMouseDown={(e) => handleMouseDown(e, col, row)}
            onMouseUp={(e) => handleMouseUp(e, col, row)}
            onClick={(e) => handleClick(e, col, row)}
          >
            {piece && (
              <span
                className={`
                  ${piece.color === "w" ? "text-white" : "text-black"}
                  ${draggedFrom === square ? "opacity-50" : ""}
                  filter drop-shadow-sm
                `}
                style={{
                  textShadow:
                    piece.color === "w"
                      ? "1px 1px 1px black"
                      : "1px 1px 1px white",
                }}
              >
                {getPieceSymbol(piece.type.toUpperCase())}
              </span>
            )}
            {isHighlighted && !piece && (
              <div className="w-3 h-3 bg-green-400 rounded-full opacity-60"></div>
            )}
          </div>
        );
      }
    }

    return squares;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Board Header - Opponent Info */}
      {gameState?.opponent && (
        <div className="w-full max-w-lg flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {gameState.opponent.username?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-white font-medium text-sm">
                {gameState.opponent.username}
              </div>
              <div className="text-cyan-300 text-xs">
                Rating: {gameState.opponent.rating}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-cyan-300">
              {playerColor === "white" ? "Black" : "White"}
            </div>
            <div className="text-white font-mono text-sm">
              {gameState.timeRemaining
                ? `${Math.floor(
                    (playerColor === "white"
                      ? gameState.timeRemaining.black
                      : gameState.timeRemaining.white) / 60000
                  )}:${String(
                    Math.floor(
                      ((playerColor === "white"
                        ? gameState.timeRemaining.black
                        : gameState.timeRemaining.white) %
                        60000) /
                        1000
                    )
                  ).padStart(2, "0")}`
                : "10:00"}
            </div>
          </div>
        </div>
      )}

      {/* Chess Board */}
      <div className="relative">
        <div
          ref={boardRef}
          className="grid grid-cols-8 border-4 border-amber-900 rounded-lg shadow-2xl bg-amber-900"
          style={{ userSelect: "none" }}
        >
          {renderBoard()}
        </div>

        {/* Game Status Overlay */}
        {gameState?.gameStatus === "finished" && (
          <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center">
            <div className="text-center p-6 bg-slate-900/90 rounded-lg border border-cyan-500/30">
              <h3 className="text-white text-xl font-bold mb-2">Game Over</h3>
              <p className="text-cyan-200">
                {gameState.winner ? `${gameState.winner} wins!` : "Draw"}
              </p>
            </div>
          </div>
        )}

        {!isPlayerTurn && gameState?.gameStatus === "playing" && (
          <div className="absolute top-2 left-2 px-3 py-1 bg-orange-500/80 text-white text-sm rounded-full">
            Opponent's turn
          </div>
        )}
      </div>

      {/* Board Footer - Your Info */}
      <div className="w-full max-w-lg flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">You</span>
          </div>
          <div>
            <div className="text-white font-medium text-sm">You</div>
            <div className="text-cyan-300 text-xs">
              Playing as {playerColor}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-cyan-300">Your time</div>
          <div className="text-white font-mono text-sm">
            {gameState?.timeRemaining
              ? `${Math.floor(
                  (playerColor === "white"
                    ? gameState.timeRemaining.white
                    : gameState.timeRemaining.black) / 60000
                )}:${String(
                  Math.floor(
                    ((playerColor === "white"
                      ? gameState.timeRemaining.white
                      : gameState.timeRemaining.black) %
                      60000) /
                      1000
                  )
                ).padStart(2, "0")}`
              : "10:00"}
          </div>
        </div>
      </div>

      {/* Move History */}
      {gameState?.moves && gameState.moves.length > 0 && (
        <div className="w-full max-w-lg p-3 bg-slate-800/50 rounded-lg border border-cyan-500/20">
          <h4 className="text-white font-medium text-sm mb-2">Move History</h4>
          <div className="max-h-32 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {gameState.moves.map((move, index) => (
                <div key={index} className="text-cyan-200">
                  {Math.ceil((index + 1) / 2)}. {move}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="w-full max-w-lg p-3 bg-slate-800/50 rounded-lg border border-cyan-500/20 text-xs">
        <div className="text-cyan-200">
          <div>Current Turn: {game.turn() === "w" ? "White" : "Black"}</div>
          <div>Player Color: {playerColor}</div>
          <div>Is Player Turn: {isPlayerTurn.toString()}</div>
          <div>Selected Square: {selectedSquare || "None"}</div>
          <div>Highlighted: {highlightedSquares.join(", ") || "None"}</div>
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
