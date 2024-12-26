import express from "express"
import {getAllUsers,createUser} from "../controllers/userControllers"
const router = express.Router()

router.post("/register", (req, res) => {
  res.send("Register route")
})

router.post("/login", (req, res) => {
    res.send("Login route")
})

router.post("/", createUser)
router.get("/", getAllUsers)
export default router