import jsonwebtoken from "jsonwebtoken";
import { db } from '../configs/db.config'; 
import { users } from "../db/schema";
import { eq } from 'drizzle-orm';
const JWT_SECRET = process.env.JWT_SECRET || "ieeeUltraSecret";
export const createToken = (userId: number): string => {
  const token = jsonwebtoken.sign({ userId }, JWT_SECRET, { expiresIn: "15m" });
  return token;
};

export const verifyToken = async (token: string) => {
  try {
    const decoded = jsonwebtoken.verify(token, JWT_SECRET);
    const { userId } = decoded as { userId: number };

    const usersList = await db.select().from(users).where(eq(users.id, userId));

    if (usersList.length === 0) {
      throw new Error("User not found");
    }

    return usersList[0]; 
  } catch (error) {
    throw new Error("Invalid token");
  }
};
