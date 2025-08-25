import express, { Router } from "express";
import { userRegistration } from "../controller/auth.controller";

const router: Router = express.Router();

router.post("/user-registration", userRegistration);
router.get("/health", (req, res) => {
  //   console.log(process.cwd());
  //   return res.json(process.cwd())
  return res.json({ message: "App is running" });
});

export default router;
