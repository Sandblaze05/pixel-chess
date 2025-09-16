import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  whitePlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  blackPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fen: { type: String, required: true },
  moves: [{ type: String }],
  status: { type: String, enum: ["ongoing", "finished"], default: "ongoing" },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  mode: { type: String, enum: ["rapid", "blitz", "bullet"], required: true },
}, { timestamps: true });

export default mongoose.model("Game", gameSchema);
