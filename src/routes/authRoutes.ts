import express from "express";
import {
  register,
  getAllUsers,
  logout,
  login,
  refreshToken,
} from "../controllers/authController";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/users", getAllUsers);
export default router;
