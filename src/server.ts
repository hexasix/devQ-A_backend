import express from "express";
import authRoutes from "./routes/authRoutes";
import cors from "cors";
import morgan from "morgan";
import { PORT } from "./config/env";
const app = express();
const port = PORT ;

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use("/auth", authRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
