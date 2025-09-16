"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

const ChessBoard = ({
  gameState,
  onMoveMade,
  playerColor = "white",
  isPlayerTurn = true,
}) => {
  // console.log("ChessBoard Props Check:", {
  //   isPlayerTurn,
  //   playerColor,
  //   gameStatus: gameState?.gameStatus,
  //   fen: gameState?.fen,
  // });
  // Update game when gameState changes
  const game = useMemo(() => {
    if (!gameState?.fen) {
      // Return a new game if no FEN is provided yet.
      return new Chess();
    }
    try {
      // Load the game state from the FEN provided by the parent.
      return new Chess(gameState.fen);
    } catch (error) {
      console.error("Invalid FEN provided in props:", error);
      return new Chess(); // Fallback to a new game on error.
    }
  }, [gameState?.fen]);

  const onDrop = useCallback(
    (sourceSquare, targetSquare) => {
      console.log("--- onDrop initiated ---");
      console.log(`Attempting move from ${sourceSquare} to ${targetSquare}`);

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
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });

        console.log("Move validation result:", move);

        if (move === null) {
          console.error("Move was invalid, snapping piece back.");
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

  // Drag validation
  const isDraggablePiece = useCallback(({ piece, sourceSquare }) => {
    // This log should appear EVERY time you click down on a piece
    console.log(`isDraggablePiece check on ${piece} at ${sourceSquare}`);

    const isUsersTurn = isPlayerTurn;
    const isCorrectColor = (piece[0] === 'w' && playerColor === 'white') ||
                           (piece[0] === 'b' && playerColor === 'black');

    const result = isUsersTurn && isCorrectColor;
    console.log(`Result: isUsersTurn=${isUsersTurn}, isCorrectColor=${isCorrectColor}, CanDrag=${result}`);
    
    return result;

}, [isPlayerTurn, playerColor]);

  // Get valid moves for the selected piece
  const getValidMoves = useCallback(
    ({ piece, sourceSquare }) => {
      if (!isDraggablePiece({ piece })) return [];

      try {
        const moves = game.moves({
          square: sourceSquare,
          verbose: true,
        });
        return moves.map((move) => move.to);
      } catch (error) {
        console.error("Error getting valid moves:", error);
        return [];
      }
    },
    [game, isDraggablePiece]
  );

  // Custom piece style
  const customPieces = useMemo(() => {
    const pieces = [
      "wP",
      "wN",
      "wB",
      "wR",
      "wQ",
      "wK",
      "bP",
      "bN",
      "bB",
      "bR",
      "bQ",
      "bK",
    ];
    const pieceComponents = {};

    pieces.forEach((piece) => {
      pieceComponents[piece] = ({ squareWidth }) => (
        <div
          style={{
            width: squareWidth,
            height: squareWidth,
            backgroundImage: `url(/pieces/${piece}.png)`,
            backgroundSize: "90%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.3))",
          }}
        />
      );
    });

    return pieceComponents;
  }, []);

  const boardStyle = {
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
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
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardOrientation={playerColor}
          isDraggablePiece={isDraggablePiece}
          customBoardStyle={boardStyle}
          customDarkSquareStyle={{ backgroundColor: "#374151" }}
          customLightSquareStyle={{ backgroundColor: "#9CA3AF" }}
          customPieces={customPieces}
          animationDuration={200}
        />

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
    </div>
  );
};

export default ChessBoard;
