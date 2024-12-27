import express from "express";
import { register } from "../controllers/authController";
const router = express.Router();

router.post("/register", register);

router.post("/login", (req, res) => {
  res.send("Login route");
});

export default router;
