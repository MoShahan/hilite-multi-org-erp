import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { successResponseMiddleware } from "./middleware/successResponseMiddleware";
import routes from "./routes";

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(successResponseMiddleware);
app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
