import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/userModel";
import { IUser } from "../models/userModel";
import { MongoError } from "mongodb";
// POST /auth/register
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as IUser;
    // Check if email and password are provided
    //if not return a 400 error
    if (!email || !password) {
      res.status(400).json({ message: "Please provide email and password" });
      return;
    }
    //check if email is a valid email
    //if not return a 400 error
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Please provide a valid email" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({ email, password: hashedPassword });
    res.status(201).json(newUser);
    return;
  } catch (err) {
    // Check if the error is a validation error
    if (err instanceof Error && err.name === "ValidationError") {
      res.status(400).json(err);
      return;
    }
    // Check if the error is a duplicate key error
    if (err instanceof MongoError && err.code === 11000) {
      // This is a duplicate key error
      res.status(400).json(err);
      return;
    }
    // If the error is not a validation error or a duplicate key error, return a 500 error
    res.status(500).json(err);
    return;
  }
};

// GET /auth/users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    const usersEmailArray = users.map((user)=>user.email)
    res.status(200).json(usersEmailArray);
    return 
  } catch (err) {
    res.status(200).json(err);
    return
  }
};
