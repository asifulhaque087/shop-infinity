import prisma from "@/packages/libs/prisma";
import type { NextFunction, Response } from "express";

import jwt, { JsonWebTokenError } from "jsonwebtoken";

export const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies.access_token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized! Token missing." });
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as { id: string; role: "user" | "seller" };

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized! Invalid token" });
    }

    const user = await prisma.users.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({ message: "Account not found!" });
    }

    req.user = user;

    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized! Token expired or Invalid" });
  }
};
