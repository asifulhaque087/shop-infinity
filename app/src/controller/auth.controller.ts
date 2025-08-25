import type { Request, Response, NextFunction } from "express";
import {
  checkOptRestrictions,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
} from "../utils/auth.helper";
import prisma from "@/packages/libs/prisma";
import { ValidationError } from "@/packages/error-handler";

export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "user");

    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({ where: email });

    if (existingUser)
      return next(new ValidationError("User already exits with this email"));

    await checkOptRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(email, name, "user-activation-mail");
    res.json(200).json({
      message: "OTP sent to email. Please verify your account",
    });
  } catch (error) {
    return next(error);
  }

  // const existingUser = await prisma;
};
