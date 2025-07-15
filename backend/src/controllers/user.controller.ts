import { Request , Response } from "express";
import { db } from "../configs/db.config";
import { users } from "../db/schema";
import { eq } from 'drizzle-orm';
export const getAllUsers = async  (req : Request , res : Response)=>{
    try {
        const allUsers = await db
        .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            role: users.role,
        })
        .from(users);
        if(!allUsers){
            res.status(404).json({Message : "there is no Data Fetched :( "});
            return;    
        }
        res.status(200).json({Message : "Data Fetched Successfully :) " , allUsers});
        return;
    } catch (error : any) {
        res.status(500).json({Message :error.message });
        return;
    }
}


export const getUserbyeamil = async (req : Request , res : Response)=>{
    const { email } = req.body;
    if(!email){
        res.status(404).json({message : "no data parsing"});
        return;
    }
    try {
        const user = await db.select(
        {
            id : users.id,
            first_name : users.firstName, 
            last_name : users.lastName ,
            email : users.email,
            Role : users.role 
        }
    ).from(users)
    .where(eq(users.email ,email)).limit(1);
    if(!user){
        res.status(404).json({Message : "Invalid data , there is no user Found !!"});
        return;
    }
    res.status(200).json({message : "User Found Successfully :)" , user});
    return;
    } catch (error : any) {
        res.status(500).json({Message :error.message });
        return;
    }
}
export const getUserbyId = async (req : Request , res : Response)=>{
    const { id } = req.body;
    if(!id){
        res.status(404).json({message : "no data parsing"});
        return;
    }
    try {
        const user = await db.select(
        {
            id : users.id,
            first_name : users.firstName, 
            last_name : users.lastName ,
            email : users.email,
            Role : users.role 
        }
    ).from(users)
    .where(eq(users.id ,id)).limit(1);
    if(!user){
        res.status(404).json({Message : "Invalid data , there is no user Found !!"});
        return;
    }
    res.status(200).json({message : "User Found Successfully :)" , user});
    return;
    } catch (error : any) {
        res.status(500).json({Message :error.message });
        return;
    }
}