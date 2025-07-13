import { NextFunction, Request, Response } from "express";
import { verifyToken } from "./token";
import { users } from "../db/schema";
import { InferSelectModel } from "drizzle-orm";


type User = InferSelectModel<typeof users>;

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await verifyToken(token);
    req.user = user; 
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Please Login Again" });
    return;
  }
};
