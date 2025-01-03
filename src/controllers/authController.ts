import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/userModel";
import { IUser } from "../models/userModel";
import { MongoError } from "mongodb";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../config/env";
import refreshTokenModel from "../models/refreshTokenModel";
import { errorResponseHandler } from "../utils/errorHandlers";
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
      return;
    }
    //3.2 check if the token has been expired or not
    if (new Date() > tokenDoc.expiresAt) {
      res.status(403).json({ error: "The refresh token has expired." });
      return;
    }
    //4. Generate new access token
    const newAccessToken = jwt.sign(
      { userId: payload.userId },
      JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(500).json({ error: "Unexpected error." });
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
export const login = async (req: Request, res: Response) => {
  try {
    //1. verify the email and the password
    const { email, password } = req.body;
    // if email or password does not exist, raise an error
    if (!email || !password) {
      res
        .status(400)
        .json({ error: "Both email and password are required to login." });
      return;
    }
    // go to the db and compare the passwords
    const user = await User.findOne({ email });
    // if user does not found in the db. Raise an error
    if (!user) {
      res.status(401).json({ error: "Invalid credential!" });
      console.log(`${email} does not exist in database`);
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      errorResponseHandler(res, 401, "Invalid credential!");
      return;
    }
    //2. Generate an access token and a refresh token for the user
    const accessToken = jwt.sign(
      { userId: user._id.toString() },
      JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { userId: user._id.toString() },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );
    //3. Store the refresh token to the db
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    await refreshTokenModel.create({
      user: user._id,
      expiresAt: expirationDate,
      token: refreshToken,
      revoked: false,
    });
    //4. send reponse with tokens
    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
      },
    });
    return;
  } catch (err) {
    console.log("login error ->", err);
    errorResponseHandler(res, 500, "Internal server error");
    return;
  }
};

//POST /auth/logout
export const logout = async (req: Request, res: Response) => {
  //Invalid the refresh Token
  try {
    const { token } = req.body;
    if (!token) {
      errorResponseHandler(res, 400, "No refresh token provided");
      return;
    }
    // 1. Find the token in the db and invalid it
    const tokenDoc = await refreshTokenModel.findOne({ token });
    if (!tokenDoc) {
      errorResponseHandler(res, 400, "Token not found in the DB!");
      return;
    }
    tokenDoc.revoked = true;
    await tokenDoc.save();
    // 2. send response to notify logout successfully
    res.status(200).json({ message: "Logged out successfully." });
    return;
  } catch (err) {
    console.log("logout error ->", err);
    errorResponseHandler(res, 500, "Internal server error.");
  }
};
