import { Request, Response } from 'express';
import { db } from '../configs/db.config'; 
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {codeGenerator} from '../utils/codeGenerator';
import {mailer} from '../utils/mailer';

export const Register = async (req: Request, res: Response) => {
  const {first_name , last_name , email , password  } = req.body;
  if(!first_name && !last_name&& !email && !password){
    res.status(400).json({message : "all fialds Required !!"});
    return;
  }
  try {
    const is_Exsit = await db.select().from(users).where(eq(users.email , email));
    if(is_Exsit){
      res.status(404).json({message : "This Email Already Used !"});
      return;
    }
    const hashPass = await bcrypt.hashSync(password,12);
    const [newUser] = await db
    .insert(users)
    .values({
        firstName : first_name, 
        lastName : last_name ,
        email : email,
        password : hashPass
      })
      .returning();

      if (!newUser){
        res.status(404).json({message : "something Wrong! can't Create User !"})
        return;
      }
      const  code = codeGenerator();
      const hashCode =  bcrypt.hashSync(code , 12);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const addCode = await db.update(users).set({verificationCode : hashCode , verificationCodeExpiresAt : expiresAt})
      .where(eq( users.email, email))
      mailer(newUser.email,`Verification Code`,
        `Dear ${newUser.firstName} your Verification Code is : ${code}`);
      const token = jwt.sign({
        User : newUser.id , role : newUser.role , email : newUser.email
      },process.env.JWT_SECRET as string,{expiresIn : '15M'})
      res.status(201).json({message : "User Created Successfully" , token});
      return;
  } catch (error) {
    console.error("Register error:", error); // مهم
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
}

export const verifyCode = async (req: Request, res: Response) => {
  const { code, email } = req.body;
  try {
    const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
    
    if (!user) {
      res.status(400).json({ error: "Invalid parsing data" });
      return;
    }

    const now = new Date();
    if (
      !user.verificationCodeExpiresAt||
      now > user.verificationCodeExpiresAt
    ) {
      res.status(400).json({ error: "Verification code has expired" });
      return;
    }

    const isValid = bcrypt.compareSync(code, user.verificationCode!);
    if (!isValid) {
      res.status(400).json({ error: "Invalid verification code" });
      return;
    }

    const [updatedUser] = await db.update(users).set({verified : true ,verificationCode : null , verificationCodeExpiresAt : null })
      .where(eq(users.email , email))
      .returning();

      const token = jwt.sign(
        {
          id: updatedUser.id,
          first_name: updatedUser.firstName,
          last_name: updatedUser.lastName,
          email: updatedUser.email,
          role: updatedUser.role,
          verified: updatedUser.verified,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "15m" }
      );
    res.status(200).json({ message: "User verified successfully" ,token});
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
};


export const Login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

      if(!user){
        res.status(404).json({message : "Invalid Credentials !!"});
        return;
      }

      const passValid = bcrypt.compareSync(password , user.password);
      if(!passValid){
        res.status(404).json({message : "Invalid Credentials !!"});
        return;
      }

      const token = jwt.sign(
        {
          id: user.id,
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.email,
          role: user.role,
          verified: user.verified,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "15m" }
      );
    res.status(200).json({Message : "You have been Logedin Successfully !" , token});
    return;
  } catch (error) {
    console.error("Register error:", error); 
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};
