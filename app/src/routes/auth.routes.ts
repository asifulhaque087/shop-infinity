import express, { Router } from "express";
import {
  createShop,
  createStripeConnectLink,
  getSeller,
  getUser,
  loginSeller,
  loginUser,
  refreshToken,
  registerSeller,
  resetUserPassword,
  userForgotPassword,
  userRegistration,
  verifySeller,
  verifyUser,
  verifyUserForgotPassword,
} from "../controller/auth.controller";
import { isAuthenticated } from "@/packages/middleware/isAuthenticated";
import { isSeller } from "@/packages/middleware/authorizeRoles";

const authRouter: Router = express.Router();

authRouter.post("/user-registration", userRegistration);
authRouter.post("/verify-user", verifyUser);
authRouter.post("/login-user", loginUser);
authRouter.post("/refresh-token", refreshToken);
authRouter.get("/logged-in-user", isAuthenticated, getUser);
authRouter.post("/forgot-password-user", userForgotPassword);
authRouter.post("/reset-password-user", resetUserPassword);
authRouter.post("/verify-forgot-password-user", verifyUserForgotPassword);

// seller

authRouter.post("/seller-registration", registerSeller);
authRouter.post("/verify-seller", verifySeller);
authRouter.post("/create-stripe-link", createStripeConnectLink);
authRouter.post("/login-seller", loginSeller);
authRouter.get("/logged-in-seller", isAuthenticated, isSeller, getSeller);

// shop
authRouter.post("/create-shop", createShop);

// ** --- health route ---

authRouter.get("/health", (req, res) => {
  return res.json({ message: "App is running" });
});

export default authRouter;
