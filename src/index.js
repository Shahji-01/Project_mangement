import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connection from "./config/db.js";
import dns from "dns";
import userRouter from "./routes/User.route.js";
import cookieParser from "cookie-parser";

dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");
dotenv.config({
  path: "./.env",
});
const app = express();

app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: "true", limit: "10kb" }));
app.use(
  cors({
    origin: process.env.CROS_ORIGIN?.split(",") || "http://localhost:3000",
    credentials: "true",
    methods: ["GET", "POST", "UPDATE", "DELETE", "PUT", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

connection()
  .then(() => {
    console.log("connection to db is done");
    app.listen(process.env.PORT || 3000, () => {
      console.log(`App is listening to port:${process.env.PORT || 3000}.`);
    });
  })
  .catch((err) => {
    console.log("Error while connecting to the db :- ", err);
  });

app.use("/api/v1/user", userRouter);

app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    success: err.success || false,
    message: err.message || "Something went wrong",
    errors: err.errors || [],
  });
});