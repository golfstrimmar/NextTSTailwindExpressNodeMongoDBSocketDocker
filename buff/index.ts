import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import Auction from "./models/Auction";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

app.use(cors({ origin: "http://localhost:3000" })); // CORS для REST
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
