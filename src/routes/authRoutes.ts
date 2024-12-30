import express from "express";
import { register,getAllUsers,login } from "../controllers/authController";
const router = express.Router();

router.post("/register", register);

router.post("/login", login)

router.get("/users",getAllUsers) 
export default router;
