import { Request,Response } from "express";
import User from "../models/userModel";

export const createUser = async (req:Request,res:Response) => {
    try{
        await User.init()
        const {email,username}= req.body
        console.log(email,username)
        const newUser =await User.create({email,username})
        res.status(201).json(newUser)
    }catch(err){
        res.status(500).json({message:(err as Error).message})
    }
}

export const getAllUsers = async (req:Request,res:Response) => {
    try{
        const users = await User.find({})
        res.status(200).json(users)
    }catch(err){
        res.status(500).json({message:(err as Error).message})
    }
}