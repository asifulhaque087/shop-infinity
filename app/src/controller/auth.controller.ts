import type { Request, Response, NextFunction } from "express";
import prisma from "@/packages/libs/prisma";
import { AuthError, ValidationError } from "@/packages/error-handler";
import bcrypt from "bcryptjs";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
  // apiVersion: "2025-02-24.acacia",
});

import {
  checkOptRestrictions,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyForgotPasswordOtp,
  verifyOtp,
} from "@/utils/auth.helper";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
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

    res.clearCookie("seller-access-token");
    res.clearCookie("seller-refresh-token");

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

// refresh token
export const refreshToken = async (
  // req: Request,
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // const refreshToken = req.cookies.refresh_token;

    const refreshToken =
      req.cookies["refresh_token"] ||
      req.cookies["seller-refresh-token"] ||
      req.headers.authorization?.split(" ")[1];

    if (!refreshToken)
      return new ValidationError("Unauthorized! No refresh token.");

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      return new JsonWebTokenError("Forbidden! Invalid refresh token");
    }

    // const user = await prisma.users.findUnique({ where: { id: decoded.id } });

    // if (!user) {
    //   return new AuthError("Forbidden! User/Seller not found");
    // }

    let account;

    if (decoded.role === "user") {
      account = await prisma.users.findUnique({
        where: { id: decoded.id },
      });
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
    }

    if (!account) {
      return res
        .status(401)
        .json({ message: "Forbidden! User/Seller not found" });
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );
    if (decoded.role === "user") {
      setCookie(res, "access_token", newAccessToken);
    } else if (decoded.role === "seller") {
      setCookie(res, "seller-access-token", newAccessToken);
    }
    req.role = decoded.role;

    // setCookie(res, "access_token", newAccessToken);

    return res.status(201).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

// get logged in user
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await handleForgotPassword(req, res, next, "user");
};

export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await verifyForgotPasswordOtp(req, res, next);
};

export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      throw new ValidationError("Email and new password are required!");
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) throw new ValidationError("User not found!");

    const isSamePassword = await bcrypt.compare(newPassword, user.password!);

    if (isSamePassword)
      throw new ValidationError(
        "New password cannot be the same as the old password"
      );

    // ** hash the new password

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      message: "Password reset successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "seller");
    const { name, email } = req.body;

    const existingUser = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ValidationError("Seller already exits with this email");
    }

    await checkOptRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "seller-activation-mail");

    return res.status(200).json({
      message: "OTP sent to email. Please verify your account",
    });
  } catch (error) {
    return next(error);
  }
};

export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body;

    if (!email || !otp || !password || !name || !phone_number || !country) {
      throw new ValidationError("All fields required");
    }

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      throw new ValidationError("Seller already exits with this email");
    }

    await verifyOtp(email, otp, next);

    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await prisma.sellers.create({
      data: { name, email, password: hashedPassword, country, phone_number },
    });

    return res.status(201).json({
      seller,
      message: "Seller register successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// create a new shop
export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;

    if (!name || !bio || !address || !sellerId || !opening_hours || !category) {
      throw new ValidationError("All fields required");
    }

    const shopData: any = {
      name,
      bio,
      address,
      opening_hours,
      category,
      sellerId,
    };

    if (website && website.trim() !== "") {
      shopData.website = website;
    }

    const shop = await prisma.shops.create({
      data: shopData,
    });

    return res.status(200).json({
      success: true,
      shop,
    });
  } catch (error) {
    return next(error);
  }
};

// create stripe connect link

// 7h30m - 8h
export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) throw new ValidationError("Seller ID is required!");

    const seller = await prisma.sellers.findUnique({ where: { id: sellerId } });

    if (!seller) throw new ValidationError("Seller not found with this Id");

    const account = await stripe.accounts.create({
      type: "express",
      email: seller?.email,
      country: "GB",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await prisma.sellers.update({
      where: {
        id: sellerId,
      },
      data: {
        stripeId: account.id,
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `http://localhost:3000/success`,
      return_url: `http://localhost:3000/success`,
      type: "account_onboarding",
    });

    return res.json({ url: accountLink.url });
  } catch (error) {
    return next(error);
  }
};

export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError("Email & password are required");
    }

    const seller = await prisma.sellers.findUnique({ where: { email } });

    if (!seller) throw new ValidationError("Invalid email or password");

    const isMatch = await bcrypt.compare(password, seller.password!);
    if (!isMatch) throw new ValidationError("Invalid email or password");

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    const accessToken = jwt.sign(
      { id: seller.id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: seller.id, role: "user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );

    setCookie(res, "seller-refresh-token", refreshToken);
    setCookie(res, "seller-access-token", accessToken);

    return res.status(200).json({
      message: "Login successfull",
      user: { id: seller.id, email: seller.email, name: seller.name },
    });
  } catch (error) {
    return next(error);
  }
};

export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;

    res.status(200).json({
      success: true,
      seller,
    });
  } catch (error) {
    next(error);
  }
};
