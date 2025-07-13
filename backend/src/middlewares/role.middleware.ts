import { NextFunction, Request, Response } from "express";

export const isAuthorizedRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as { role?: string };

    if (!user || !user.role) {
      res.status(400).json({ message: "Bad request: User or role not found" });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    next();
  };
};
