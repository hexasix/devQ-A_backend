import { Request, Response } from "express";
import User from "../models/userModel";
import { MongoError, MongoServerError } from "mongodb";

export const createUser = async (req: Request, res: Response) => {
  try {
    await User.init();
    const { email, username, password } = req.body;
    console.log(email, username, password);
    const newUser = await User.create({ email, username, password });
    res.status(201).json(newUser);
  } catch (err) {
    if (err instanceof Error && err.name === "ValidationError") {
      res.status(400).json(err);
      return;
    }
    if (err instanceof MongoError && err.code === 11000) {
      // This is a duplicate key error
      res.status(400).json(err);
      return
    }
    res.status(500).json(err);
    return 
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};
