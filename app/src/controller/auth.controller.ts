import type { Request, Response, NextFunction } from "express";
import prisma from "@/packages/libs/prisma";
import { AuthError, ValidationError } from "@/packages/error-handler";

import bcrypt from "bcryptjs";

import {
  checkOptRestrictions,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyOtp,
} from "@/utils/auth.helper";
import jwt from "jsonwebtoken";
import { setCookie } from "@/utils/cookies/setCookie";

export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "user");

    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser)
      throw new ValidationError("User already exits with this email");

    await checkOptRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "user-activation-mail");
    return res.status(200).json({
      message: "OTP sent to email. Please verify your account",
    });
  } catch (error) {
    return next(error);
  }

  // const existingUser = await prisma;
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name } = req.body;
    if (!email || !otp || !password || !name) {
      throw new ValidationError("All fields are required");
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      throw new ValidationError("User already exits with this email");
    }

    await verifyOtp(email, otp, next);

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });

    return res.status(201).json({
      success: true,
      message: "User register successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError("Email & password are required");
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) throw new AuthError("user doesn't exits");

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) throw new AuthError("Invalid credentials");

    const accessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );

    setCookie(res, "refresh_token", refreshToken);
    setCookie(res, "access_token", accessToken);

    return res.status(200).json({
      message: "Login successfull",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    return next(error);
  }
};

export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await handleForgotPassword(req, res, next, "user");
};
