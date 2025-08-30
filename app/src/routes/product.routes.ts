import express, { Router } from "express";
import {
  createDiscountCodes,
  deleteDiscountCode,
  getCategories,
  getDiscountCodes,
} from "@/controller/product.controller";
import { isAuthenticated } from "@/packages/middleware/isAuthenticated";

const productRouter: Router = express.Router();

productRouter.get("/get-categories", getCategories);
productRouter.post(
  "/create-discount-code",
  isAuthenticated,
  createDiscountCodes
);
productRouter.get("/get-discount-codes", isAuthenticated, getDiscountCodes);
productRouter.delete(
  "/delete-discount-code/:id",
  isAuthenticated,
  deleteDiscountCode
);

export default productRouter;
