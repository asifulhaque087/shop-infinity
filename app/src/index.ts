import express from "express";

import cors from "cors";
import cookieParser from "cookie-parser";
import SwaggerUi from "swagger-ui-express";
import { errorMiddleware } from "@/packages/error-handler/error-middleware";
import initializeConfig from "@/libs/initialize-site-config";
import authRouter from "@/routes/auth.routes";
import productRouter from "@/routes/product.routes";
const swaggerDocument = require("./swagger-output.json");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Hello API" });
});

app.use("/api-docs", SwaggerUi.serve, SwaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
  res.json(swaggerDocument);
});

// router
// app.use("/api/product", productRouter);

app.use("/product/api", productRouter);
app.use("/api", authRouter);

app.use(errorMiddleware);

const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const server = app.listen(port, () => {
  console.log(`Auth service is running at http://localhost:${port}/api`);
  console.log(`Swagger Docs available at http://localhost:${port}/api`);

  // 10h11m
  try {
    initializeConfig();
    console.log("Site config initialize successfully!");
  } catch (error) {
    console.error("❌ Failed to initialize  site config:", error);
  }
});

server.on("error", (err) => {
  console.log("Server Error ", err);
});
