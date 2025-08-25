import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, 
  provider: { type: String, default: "credentials" },
})

export default mongoose.models.User || mongoose.model("User", UserSchema)
