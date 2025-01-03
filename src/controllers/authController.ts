import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/userModel";
import { IUser } from "../models/userModel";
import { MongoError } from "mongodb";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../config/env";
import refreshTokenModel from "../models/refreshTokenModel";
type tJwt = {
  userId: string;
  iat: number;
  exp: number;
};
const checkIfEmailAddressValid = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
//POST /auth/refresh-token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    //1. if token does not exist
    if (!token) {
      res.status(401).json({ error: "No token is provided." });
      return;
    }
    //2. check if the token is valid and not expired
    let payload;
    try {
      payload = jwt.verify(token, JWT_REFRESH_SECRET) as tJwt;
    } catch (err) {
      res.status(403).json({ error: "Invalid or expired token." });
      return;
    }
    //3. retrieve the token information from db
    const tokenDoc = await refreshTokenModel.findOne({ token });
    // if the token does not exist in the db
    if (!tokenDoc) {
      res
        .status(403)
        .json({ error: "The refresh token is not in the db. It is invalid." });
      return;
    }
    //3.1 check if it has been revoked or not
    if (tokenDoc.revoked) {
      res.status(403).json({ error: "The refresh token has been revoked." });
      return
    }
    //3.2 check if the token has been expired or not
    if (new Date() > tokenDoc.expiresAt) {
      res.status(403).json({ error: "The refresh token has expired." });
      return
    }
    //4. Generate new access token
    const newAccessToken = jwt.sign(
      { userId: payload.userId },
      JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(500).json({error:"Unexpected error."})
  }
};
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
    if (!checkIfEmailAddressValid(email)) {
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
    const usersEmailArray = users.map((user) => user.email);
    res.status(200).json(usersEmailArray);
    return;
  } catch (err) {
    res.status(200).json(err);
    return;
  }
};

// POST /auth/login
export const login = async (req: Request, res: Response) => {};
