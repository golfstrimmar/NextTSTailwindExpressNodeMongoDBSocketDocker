import { Socket } from "socket.io";
import Auction from "./../models/Auction.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "./../models/User.js";
import axios from "axios";


export default (io, socket) => {
  socket.on("addAuction", async (payload) => {
    console.log("===Adding new auction:====", payload);
    // Извлекаем auctionData и token
    const { auctionData, token } = payload;
    const data = auctionData || payload; // На случай, если структура отличается
    console.log("===Extracted data:====", data);
    // Проверяем токен
    if (!token) {
      console.log("===Validation error:====", "Token is required");
      return io.emit("erroraddingauction", "Authentication required");
    }
    let creatorId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      creatorId = decoded.userId;
      const creator = await User.findById(creatorId);
      console.log("=====creator=====", creator);
      if (!creator) {
        console.log("===Validation error:====", "User not found");
        return io.emit("erroraddingauction", "User not found");
      }
    } catch (error) {
      console.error("Token verification error:", error);
      return io.emit("erroraddingauction", "Invalid token");
    }
    const sanitizedData = {
      title: String(data.title),
      startPrice: Number(data.startPrice),
      endTime: new Date(data.endTime),
      imageUrl: data.imageUrl || "",
      creator: data.creator, // Добавляем creator
    };
    try {
      const existingAuction = await Auction.findOne({
        title: sanitizedData.title,
        status: "active",
      });
      if (existingAuction) {
        const errorMessage = `Auction with title "${sanitizedData.title}" already exists`;
        console.log("===Validation error:====", errorMessage);
        return io.emit("erroraddingauction", errorMessage);
      }
      const newAuction = new Auction(sanitizedData);
      console.log("===New auction instance:====", newAuction);
      await newAuction.save();
      console.log("===Auction saved:====", newAuction);
      const auctions = await Auction.find({ status: "active" }).populate(
        "creator",
        "userName"
      );
      console.log("===Sending auctions list:====", auctions);
      io.emit("auctionsList", auctions);
      io.emit("auctionAdded", { message: "Auction added successfully" });
    } catch (error) {
      console.error("Error adding auction:", error);
      io.emit("erroraddingauction", error.message);
    }
  });
};
