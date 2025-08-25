import express, { Router } from "express";
import {
  loginUser,
  userRegistration,
  verifyUser,
} from "../controller/auth.controller";

const router: Router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser);
router.post("/login-user", loginUser);

// ** --- health route ---

router.get("/health", (req, res) => {
  return res.json({ message: "App is running" });
});

export default router;
