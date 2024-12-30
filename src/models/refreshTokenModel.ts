import mongoose from "mongoose";

export interface iRefreshToken extends mongoose.Document {
  user: mongoose.Schema.Types.ObjectId;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  revoked: boolean;
  replacedByToken?: string;
}
const refreshTokenSchema = new mongoose.Schema<iRefreshToken>({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  token: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  replacedByToken: { type: String },
});

export default mongoose.model("RefreshToken", refreshTokenSchema);
