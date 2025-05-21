import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../prismaClient.js';
 import { generateVerificationCode } from '../utils/helper.js';
 import { sendEmail } from '../utils/mailer.js';

export const register = async (req , res) => {
    const {first_name , last_name , email , role = "user" , password} = req.body;
    const hashedPass = bcrypt.hashSync(password,10);    
    try {
        const user = await prisma.user.findUnique({
            where : {
                email : email
            }
        });
    
        if(user){
            return res.status(400).json({error :("Invalid Data")});
        }
    
        
        const newUser = await prisma.user.create({
            data: {
                first_name,
                last_name,
                email,
                password: hashedPass,
                role  : role
            }
        });

        const v_code = generateVerificationCode();
        const hashCode = bcrypt.hashSync(v_code, 10);

        await prisma.user.update({
            where: { id: newUser.id },
            data: {
                verification_code: hashCode,
                verification_code_expires_at: new Date(Date.now() + 15 * 60 * 1000)
            }
        });

        await sendEmail
        (email, "Your verification code", `Your verification code is: ${v_code}`);
    
        const token = jwt.sign(
            {   
                id : newUser.id ,
                first_name : newUser.first_name ,
                last_name : newUser.last_name,
                email : newUser.email ,
                role : newUser.role,
                verified : false
            } ,
             process.env.JWT_SECRET ,{
                expiresIn : "1h"
            });

            res.cookie('token' , token , {
                httpOnly: true,
                secure: false, 
                sameSite: 'strict',
                maxAge: 3600000 
            })

            res.status(201).json({  message: "User Created Successfully , please verify your email" } );
    } catch (error) {
       res.status(500).json(error.message) 
    }
    
};

export const sendCode = async (req, res) => {
    const  user  = req.user;
    const v_code  = generateVerificationCode();
    const hashCode = bcrypt.hashSync(v_code,10);
    try {
        if(user.verified)
            return res.status(400).json({ message : "User already verified "});        
        await sendEmail
            (user.email, "Your verification code" ,`Your verification code is: ${v_code}`);

            await prisma.user.update({
                data : {
                    verification_code : hashCode,
                    verification_code_expires_at : new Date(Date.now() + 15 * 60 * 1000)
                },
                where : {
                    id : user.id
                }
            });
            return res.status(200).json({ message: "Verification code sent successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

export const verifyCode = async (req, res) => {
    const { code } = req.body;
    const email = req.user.email
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(400).json({ error: "Invalid parsing data" });
        }

        const now = new Date();
        if (!user.verification_code_expires_at || now > user.verification_code_expires_at) {
            return res.status(400).json({ error: "Verification code has expired" });
        }
        
        const isValid = bcrypt.compareSync(code, user.verification_code);
        
        if (!isValid) {
            return res.status(400).json({ error: "Invalid verification code" });
        }
        const updatedUser = await prisma.user.update({
            where: { email },
            data: {
                verified: true,
                verification_code: null,
                verification_code_expires_at: null
            }
        });
            // token
            const token = jwt.sign({
                id : updatedUser.id,
                first_name : updatedUser.first_name ,
                last_name : updatedUser.last_name,
                email : updatedUser.email ,
                role : updatedUser.role,
                verified : updatedUser.verified
    
            },process.env.JWT_SECRET , {
                expiresIn : "1h"
            })
             
            res.cookie('token' , token , {
                httpOnly: true,
                secure: false, 
                sameSite: 'strict',
                maxAge: 3600000 
            })

            return res.status(200).json({ message: "User verified successfully" });
        
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const login = async (req,res) => {
    const {email , password} = req.body;
    try {
        const user = await prisma.user.findUnique({
            where : {
                email : email
            }
        })

        if(!user){
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const isPasswordValid = bcrypt.compareSync(password , user.password);
        if(!isPasswordValid){
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        if(!user.verified){
            res.status(403).json({message : "unverified"});
            return;
        }
        const token = jwt.sign({
            id : user.id,
            first_name : user.first_name ,
            last_name : user.last_name,
            email : user.email ,
            role : user.role,
            verified : user.verified

        },process.env.JWT_SECRET , {
            expiresIn : "1h"
        })
        // 
        res.cookie('token' , token , {
            httpOnly: true,
            secure: false, 
            sameSite: 'strict',
            maxAge: 3600000 
        })

        res.status(200).json({ message: "Login successful" });
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};


export const logout = async (_req ,res)=>{
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'strict',
        secure: false 
    });
    res.status(200).json({ message: "Logged out successfully" });
}

export const getAllUsers = async (_req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true,
                verified: true,
                createdAt: true 
            }
        })
        if (users.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }
    
        res.status(200).json({users})
    } catch (error) {
        res.status(500).json({message : error.message});
    }  
};

export const updateUserRole = async (req, res) => {
    const id = req.params.id;

    try {
        const user = await prisma.user.findUnique({
            where : {
                id : parseInt(id)
            }
        })

        if(user.role === "admin")
            return res.status(400).json({ message: "This user is already an admin." });
        const update = await prisma.user.update({
            where : {
                id : parseInt(id)
            },
            data: {
                role : "admin"
            }
        })
        return res.status(200).json({ message: "User promoted to admin", user_id: update.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
