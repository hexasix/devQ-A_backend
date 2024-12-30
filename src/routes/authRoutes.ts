import express from "express";
import { register,getAllUsers } from "../controllers/authController";
const router = express.Router();

router.post("/register", register);

router.post("/login", (req, res) => {
  res.send("Login route");
});

router.get("/users",getAllUsers) 
export default router;
