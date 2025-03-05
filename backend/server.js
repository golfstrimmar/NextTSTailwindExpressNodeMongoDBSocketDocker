import express from "express";
import http from "http";
import { connectDB } from "./config/db.js";
import multer from "multer";
// import User from "./models/User.js";
// import Comment from "./models/Comment.js";
import { Server } from "socket.io";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import cors from "cors";
import Auction from "./models/Auction.js";
// ===========================


dotenv.config();
const app = express();
connectDB();
dotenv.config();
const server = http.createServer(app);

// ===========================

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

app.use(cors({ origin: "*" })); // CORS для REST
app.use(express.json());
// Middleware для логирования
app.use((req, res, next) => {
  console.log(
    `Incoming request: method=${req.method} url=${
      req.url
    } body=${JSON.stringify(req.body, null, 2)}`
  );
  next();
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Маршрут для аукционов
app.get("/api/auctions", async (req, res) => {
  try {
    const auctions = await Auction.find({ status: "active" });
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
const PORT = process.env.PORT || 5000; // По умолчанию 5000, если PORT не задан
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});