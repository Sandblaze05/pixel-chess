import { Chess } from "chess.js";
import Game from "../models/Game.js";
import User from "../models/User.js";

export const createGame = async (whitePlayerId, blackPlayerId, mode) => {
    const newGame = await Game.create({
        players: [whitePlayerId, blackPlayerId],
        whitePlayer: whitePlayerId,
        blackPlayer: blackPlayerId,
        fen: new Chess().fen(),
        status: "ongoing",
        mode,
        createdAt: new Date()
    });
    return newGame;
}

function calculateElo(playerRating, opponentRating, score, K = 32) {
    // Expected score
    const expected = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    // New rating
    const newRating = playerRating + K * (score - expected);
    return Math.round(newRating);
}

export const validateMove = async (gameId, userId, move) => {
    try {
        const game = await Game.findById(gameId);

        if (!game) {
            return { valid: false, error: "Game not found" };
        }

        if (game.status !== "ongoing") {
            return { valid: false, error: "Game is not active" };
        }

        // Check if user is a player in this game
        const isWhitePlayer = game.whitePlayer.toString() === userId;
        const isBlackPlayer = game.blackPlayer.toString() === userId;

        if (!isWhitePlayer && !isBlackPlayer) {
            return { valid: false, error: "You are not a player in this game" };
        }

        // Check if it's the player's turn
        const chess = new Chess(game.fen);
        const currentTurn = chess.turn(); // 'w' or 'b'

        const isPlayersTurn = (currentTurn === 'w' && isWhitePlayer) ||
            (currentTurn === 'b' && isBlackPlayer);

        if (!isPlayersTurn) {
            return { valid: false, error: "It's not your turn" };
        }

        // Validate the move itself (basic check)
        const testMove = chess.move(move);
        if (!testMove) {
            return { valid: false, error: "Invalid move" };
        }

        return {
            valid: true,
            game,
            isWhitePlayer,
            currentTurn
        };

    } catch (error) {
        return { valid: false, error: "Validation failed" };
    }
};

export const makeMove = async (gameId, move) => {
    try {
        const game = await Game.findById(gameId);
        if (!game) throw new Error("Game not found");

        if (game.status !== "ongoing") {
            throw new Error("Game is already finished");
        }

        const chess = new Chess(game.fen);
        const result = chess.move(move);
        if (!result) throw new Error("Invalid move");

        // Update game state
        game.fen = chess.fen();
        game.moves.push(result.san);
        game.lastMoveAt = new Date();

        let winner = null;
        let gameOverReason = null;

        if (chess.isGameOver()) {
            game.status = "finished";
            game.endedAt = new Date();

            if (chess.isCheckmate()) {
                // Current turn is the losing side since they can't move
                const isWhiteTurn = chess.turn() === 'w';
                winner = isWhiteTurn ? game.blackPlayer : game.whitePlayer;
                game.winner = winner;
                gameOverReason = "checkmate";
            } else if (chess.isStalemate()) {
                game.winner = null;
                gameOverReason = "stalemate";
            } else if (chess.isThreefoldRepetition()) {
                game.winner = null;
                gameOverReason = "repetition";
            } else if (chess.isInsufficientMaterial()) {
                game.winner = null;
                gameOverReason = "insufficient_material";
            } else if (chess.isDraw()) {
                game.winner = null;
                gameOverReason = "draw";
            }

            // Update ELO ratings
            await updatePlayerRatings(game, winner);
        }

        await game.save();

        return {
            fen: game.fen,
            move: result.san,
            status: game.status,
            winner: game.winner,
            reason: gameOverReason,
            isCheck: chess.isCheck(),
            turn: chess.turn(),
            moveNumber: Math.ceil(game.moves.length / 2)
        };
    } catch (error) {
        throw new Error(`Move failed: ${error.message}`);
    }
};

async function updatePlayerRatings(game, winner) {
    const [whitePlayer, blackPlayer] = await Promise.all([
        User.findById(game.whitePlayer),
        User.findById(game.blackPlayer)
    ]);

    if (!whitePlayer || !blackPlayer) {
        console.error("Could not find players for ELO update");
        return;
    }

    const K_FACTORS = {
        bullet: 40,
        blitz: 32,
        rapid: 24,
    };

    const mode = game.mode;
    const kFactor = K_FACTORS[mode];

    // Store original ratings for calculation
    const originalWhiteRating = whitePlayer.elo[mode];
    const originalBlackRating = blackPlayer.elo[mode];

    if (winner === null) {
        // Draw
        whitePlayer.elo[mode] = calculateElo(originalWhiteRating, originalBlackRating, 0.5, kFactor);
        blackPlayer.elo[mode] = calculateElo(originalBlackRating, originalWhiteRating, 0.5, kFactor);
        whitePlayer.stats.draws++;
        blackPlayer.stats.draws++;
    } else {
        const whiteWon = winner.toString() === game.whitePlayer.toString();

        whitePlayer.elo[mode] = calculateElo(originalWhiteRating, originalBlackRating, whiteWon ? 1 : 0, kFactor);
        blackPlayer.elo[mode] = calculateElo(originalBlackRating, originalWhiteRating, whiteWon ? 0 : 1, kFactor);

        if (whiteWon) {
            whitePlayer.stats.wins++;
            blackPlayer.stats.losses++;
        } else {
            blackPlayer.stats.wins++;
            whitePlayer.stats.losses++;
        }
    }

    // Update last played
    whitePlayer.lastPlayed = new Date();
    blackPlayer.lastPlayed = new Date();

    await Promise.all([whitePlayer.save(), blackPlayer.save()]);
}

// Additional helper function for abandonment/timeout
export const endGameByTimeout = async (gameId, timedOutPlayerId) => {
    const game = await Game.findById(gameId);
    if (!game || game.status !== "ongoing") return null;

    game.status = "finished";
    game.endedAt = new Date();
    game.winner = timedOutPlayerId.toString() === game.whitePlayer.toString()
        ? game.blackPlayer
        : game.whitePlayer;

    await updatePlayerRatings(game, game.winner);
    await game.save();

    return {
        status: "finished",
        winner: game.winner,
        reason: "timeout"
    };
};

// Function to get game state for a specific user
export const getGameForUser = async (gameId, userId) => {
    const game = await Game.findById(gameId);

    if (!game) {
        throw new Error("Game not found");
    }

    const isPlayer = game.whitePlayer.toString() === userId ||
        game.blackPlayer.toString() === userId;

    if (!isPlayer) {
        throw new Error("Access denied");
    }

    const chess = new Chess(game.fen);

    return {
        gameId: game._id,
        fen: game.fen,
        status: game.status,
        moves: game.moves,
        mode: game.mode,
        white: game.whitePlayer,
        black: game.blackPlayer,
        winner: game.winner,
        yourColor: game.whitePlayer.toString() === userId ? 'white' : 'black',
        isYourTurn: (chess.turn() === 'w' && game.whitePlayer.toString() === userId) ||
            (chess.turn() === 'b' && game.blackPlayer.toString() === userId),
        isCheck: chess.isCheck(),
        createdAt: game.createdAt,
        lastMoveAt: game.lastMoveAt
    };
};