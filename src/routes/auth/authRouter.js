import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../../prismaClient.js'
import { generateVerificationCode } from '../../utils/helper.js'
import { sendEmail } from '../../utils/mailer.js'
import authorizeRole from '../../middlware/authorizeRole.js'
import rateLimit from 'express-rate-limit';
const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    keyGenerator: (req) => req.body.email,
    message: 'Too many login attempts for this user, please try again after 10 minutes',
  });


router.post('/register' , async (req , res) => {
    const {first_name , last_name , email , role = "user" , password} = req.body;
    const hashedPass = bcrypt.hashSync(password,10);
    const v_code  = generateVerificationCode();
    const hashCode = bcrypt.hashSync(v_code,10);
    
    try {
        const user = await prisma.user.findUnique({
            where : {
                email : email
            }
        });
    
        if(user){
            res.status(400).json({error :("Invalid Data")});
        }
    
        
        const newUser = await prisma.user.create({
            data: {
                first_name,
                last_name,
                email,
                password: hashedPass,
                role  : role,
                verification_code : hashCode
            }
        });
    
        // const token = jwt.sign(
        //     {   
        //         id : newUser.id ,
        //         first_name : newUser.first_name ,
        //         last_name : newUser.last_name,
        //         email : newUser.email ,
        //         role : newUser.role,
        //         verified : newUser.verified
        //     } ,
        //      process.env.JWT_SECRET ,{
        //         expiresIn : "15m"
        //     });

            await sendEmail
            (email, "Your verification code" ,`Your verification code is: ${v_code}`);

            res.status(201).json({  message: "User Created Successfully" });
    } catch (error) {
       res.status(500).json(error.message) 
    }
    
});


router.post('/verification', async (req, res) => {
    const { email, code } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(400).json({ error: "Invalid parsing data" });
        }

        const isValid = bcrypt.compareSync(code, user.verification_code);

        if (isValid) {
            await prisma.user.update({
                where: { email },
                data: {
                    verified: true,
                    verification_code: null
                }
            });

            return res.status(200).json({ message: "User verified successfully" });
        } else {
            return res.status(400).json({ error: "Invalid verification code" });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.post('/login' ,  loginLimiter ,async (req , res) => {
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
});


router.post('/logout' , async (req , res) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'strict',
        secure: false 
    });
    res.status(200).json({ message: "Logged out successfully" });
})


/* authorizeRole("admin") :  Middlware for admins check  */
router.get('/all' , authorizeRole("admin") , async (req,res) => {
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
});

router.put('/updateRole/:id' ,authorizeRole("admin") ,async (req,res) => {
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
})


export default router;