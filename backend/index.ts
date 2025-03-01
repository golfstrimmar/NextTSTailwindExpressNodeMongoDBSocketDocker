import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.get("/", (req, res) => {
  res.send("Auction Backend");
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});