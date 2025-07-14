import { Request , Response } from "express";
import { db } from "../configs/db.config";
import { users } from "../db/schema";

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
