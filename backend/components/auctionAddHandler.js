import Auction from "./../models/Auction.js";
import jwt from "jsonwebtoken";
import User from "./../models/User.js";

export default (io, socket) => {
  const closeAuction = async (auctionId) => {
    try {
      const auction = await Auction.findById(auctionId).populate(
        "bids.user",
        "userName"
      ); // Популяция user в bids
      if (!auction || auction.status !== "active") return;

      let winner = null;
      if (auction.bids && auction.bids.length > 0) {
        winner = auction.bids.reduce((maxBid, bid) =>
          bid.amount > maxBid.amount ? bid : maxBid
        );
      }

      await Auction.updateOne(
        { _id: auction._id },
        {
          status: "ended",
          ...(winner && {
            winner: { user: winner.user._id, amount: winner.amount },
          }), // Сохраняем _id в базе
        }
      );

      console.log(
        `Auction ${auction._id} ended. Winner: ${
          winner ? winner.user.userName : "None"
        }`
      );
      io.emit("auctionClosed", {
        auctionId: auction._id,
        winner: winner
          ? { user: winner.user.userName, amount: winner.amount }
          : null, // Отправляем userName клиенту
      });
    } catch (error) {
      console.error("Error closing auction:", error);
    }
  };

  // Восстановление таймеров при старте сервера
  const restoreAuctionTimers = async () => {
    try {
      const activeAuctions = await Auction.find({ status: "active" });
      const now = new Date();

      for (const auction of activeAuctions) {
        const timeLeft = new Date(auction.endTime) - now;
        if (timeLeft > 0) {
          setTimeout(() => closeAuction(auction._id), timeLeft);
          console.log(
            `Restored timer for auction ${auction._id}, time left: ${timeLeft}ms`
          );
        } else {
          closeAuction(auction._id); // Если аукцион уже просрочен
        }
      }
    } catch (error) {
      console.error("Error restoring auction timers:", error);
    }
  };
  restoreAuctionTimers();

  socket.on("addAuction", async (payload) => {
    console.log("===Adding new auction:====", payload);
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
      creator: creatorId,
      currentBid: null,
      bids: [],
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

      // Устанавливаем таймер для завершения
      const timeLeft = new Date(newAuction.endTime) - new Date();
      if (timeLeft > 0) {
        setTimeout(() => closeAuction(newAuction._id), timeLeft);
        console.log(
          `Timer set for auction ${newAuction._id}, time left: ${timeLeft}ms`
        );
      } else {
        closeAuction(newAuction._id); // Если аукцион уже просрочен
      }

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
