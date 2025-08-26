import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, 
  provider: { type: String, default: "credentials" },
  image: { type: String },

  elo: { 
    rapid: { type: Number, default: 1200 },
    blitz: { type: Number, default: 1200 },
    bullet: { type: Number, default: 1200 },
   },

   stats: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
   },

   guildId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild' },
})

export default mongoose.models.User || mongoose.model("User", UserSchema)
