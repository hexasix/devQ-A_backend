import dotenv from "dotenv"

dotenv.config()

export const PORT = process.env.PORT || "8000"
export const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/DevQnA"
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret"
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret"
